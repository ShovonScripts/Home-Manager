const assert = require('node:assert/strict');
const { test } = require('node:test');
const { DatabaseSync } = require('node:sqlite');
const { createLoader } = require('./support.cjs');

function createAdapter() {
  const sqlite = new DatabaseSync(':memory:');
  const operations = [];
  const adapter = {
    sqlite,
    operations,
    async execAsync(sql) { operations.push(sql); sqlite.exec(sql); },
    async getFirstAsync(sql, params = []) { return sqlite.prepare(sql).get(...params) ?? null; },
    async getAllAsync(sql, params = []) { return sqlite.prepare(sql).all(...params); },
    async runAsync(sql, params = []) { operations.push(sql); return sqlite.prepare(sql).run(...params); },
    async withTransactionAsync(task) {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return adapter;
}

function databaseModules(adapter, open = async () => adapter) {
  return createLoader({ 'expo-sqlite': { openDatabaseAsync: open } });
}

function snapshot(sqlite) {
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all();
  return Object.fromEntries(tables.map(({ name }) => [name, sqlite.prepare(`SELECT * FROM ${name} ORDER BY id`).all()]));
}

async function createLegacyDatabase(adapter) {
  await createLoader()('src/storage/migrations.ts').migrateDatabase(adapter);
  adapter.sqlite.exec(`
    PRAGMA user_version = 0;
    INSERT INTO households VALUES ('legacy-home', 'Keep This Home', '?', 100, 200);
    INSERT INTO household_members VALUES ('legacy-member', 'legacy-home', 'Shovon', 'admin', NULL, 100, 200);
    INSERT INTO grocery_lists VALUES ('legacy-list', 'legacy-home', 'Keep My Groceries', 0, 100, 200);
    INSERT INTO grocery_items VALUES ('legacy-item', 'legacy-list', 'Rice', '2 kg', 'Grains', 1, 'Shovon', 100, 200);
    INSERT INTO expense_categories VALUES ('legacy-category', 'Custom category', 'receipt', '#123456', 100, 200);
    INSERT INTO expenses VALUES ('legacy-expense', 'legacy-home', 'legacy-category', 'Keep My Expense', 320.5, '?', 'Shovon', 100, 'Keep notes', 100, 200);
    INSERT INTO bills VALUES ('legacy-bill', 'legacy-home', 'Keep My Bill', 1200, '?', 100, 1, 'Utilities', 'monthly', 'Keep reference', 100, 200);
    INSERT INTO task_categories VALUES ('legacy-task-category', 'Existing only', '#123456', 100, 200);
    INSERT INTO tasks VALUES ('legacy-task', 'legacy-home', 'Existing only', NULL, 'legacy-task-category', NULL, 100, 0, 100, 200);
    INSERT INTO reminders VALUES ('legacy-reminder', 'legacy-home', 'Existing only', 100, 0, 'general', NULL, 100, 200);
    INSERT INTO important_dates VALUES ('legacy-date', 'legacy-home', 'Existing only', 100, 1, 'event', 100, 200);
    INSERT INTO notes VALUES ('legacy-note', 'legacy-home', 'Existing only', 'Keep this record', 100, 200);
  `);
}

test('concurrent initialization and repository access open one database, migrate once, and seed once', async (t) => {
  const adapter = createAdapter();
  t.after(() => adapter.sqlite.close());
  let opens = 0;
  const load = databaseModules(adapter, async (filename) => {
    assert.equal(filename, 'homemanager.db');
    opens++;
    await new Promise((resolve) => setImmediate(resolve));
    return adapter;
  });
  const api = load('src/storage/database.ts');
  const initialization = api.initializeDatabase();
  assert.equal(api.initializeDatabase(), initialization);
  const results = await Promise.all(Array.from({ length: 20 }, () => api.getDatabase()));
  await initialization;
  assert.equal(opens, 1);
  assert.ok(results.every((result) => result === adapter));
  assert.equal(adapter.sqlite.prepare('PRAGMA user_version').get().user_version, 1);
  assert.equal(adapter.sqlite.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM households').get().count, 1);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM household_members').get().count, 1);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM expense_categories').get().count, 5);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM task_categories').get().count, 3);
  assert.equal(adapter.operations.filter((sql) => sql.includes('CREATE TABLE')).length, 1);
  await api.initializeDatabase();
  assert.equal(opens, 1);
});

test('adopting a populated, unversioned database preserves all schemas and records exactly', async (t) => {
  const adapter = createAdapter();
  t.after(() => adapter.sqlite.close());
  await createLegacyDatabase(adapter);
  const recordsBefore = snapshot(adapter.sqlite);
  const schemaBefore = adapter.sqlite.prepare('SELECT name, sql FROM sqlite_master ORDER BY name').all();
  const load = databaseModules(adapter);
  await load('src/storage/database.ts').initializeDatabase();
  assert.deepEqual(snapshot(adapter.sqlite), recordsBefore);
  assert.deepEqual(adapter.sqlite.prepare('SELECT name, sql FROM sqlite_master ORDER BY name').all(), schemaBefore);
  assert.equal(adapter.sqlite.prepare('PRAGMA user_version').get().user_version, 1);

  // Currency fallback is non-destructive; old member names also remain unchanged.
  const household = await load('src/storage/repositories/householdRepository.ts').HouseholdRepository.getHousehold();
  const expenses = await load('src/storage/repositories/expenseRepository.ts').ExpenseRepository.getExpenses('legacy-home');
  const bills = await load('src/storage/repositories/billRepository.ts').BillRepository.getBills('legacy-home');
  assert.equal(household.currency, '৳');
  assert.equal(expenses[0].currency, '৳');
  assert.equal(bills[0].currency, '৳');
  assert.equal(expenses[0].paidBy, 'Shovon');
  assert.deepEqual(snapshot(adapter.sqlite), recordsBefore);
});

for (const failurePoint of ['schema', 'version']) {
  test(`a failed ${failurePoint} migration rolls back schema/version and can retry on the same connection`, async (t) => {
    const adapter = createAdapter();
    t.after(() => adapter.sqlite.close());
    const exec = adapter.execAsync.bind(adapter);
    let shouldFail = true;
    adapter.execAsync = async (sql) => {
      await exec(sql);
      if (shouldFail && (failurePoint === 'schema' ? sql.includes('CREATE TABLE') : sql.startsWith('PRAGMA user_version ='))) {
        shouldFail = false;
        throw new Error('Simulated migration failure');
      }
    };
    let opens = 0;
    const load = databaseModules(adapter, async () => { opens++; return adapter; });
    const api = load('src/storage/database.ts');
    await assert.rejects(api.getDatabase(), /Simulated migration failure/);
    assert.equal(adapter.sqlite.prepare('PRAGMA user_version').get().user_version, 0);
    assert.equal(adapter.sqlite.prepare("SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table'").get().count, 0);
    await api.getDatabase();
    assert.equal(opens, 1);
    assert.equal(adapter.sqlite.prepare('PRAGMA user_version').get().user_version, 1);
    assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM households').get().count, 1);
  });
}

test('a failed first-run seed cannot leave a partial household that suppresses a retry', async (t) => {
  const adapter = createAdapter();
  t.after(() => adapter.sqlite.close());
  const run = adapter.runAsync.bind(adapter);
  let shouldFail = true;
  adapter.runAsync = async (sql, params) => {
    if (shouldFail && sql.includes('INTO expense_categories')) {
      shouldFail = false;
      throw new Error('Simulated seed failure');
    }
    return run(sql, params);
  };
  let opens = 0;
  const load = databaseModules(adapter, async () => { opens++; return adapter; });
  const api = load('src/storage/database.ts');
  await assert.rejects(api.initializeDatabase(), /Simulated seed failure/);
  assert.equal(adapter.sqlite.prepare('PRAGMA user_version').get().user_version, 1);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM households').get().count, 0);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM household_members').get().count, 0);
  await api.initializeDatabase();
  assert.equal(opens, 1);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM households').get().count, 1);
  assert.equal(adapter.sqlite.prepare('SELECT COUNT(*) AS count FROM expense_categories').get().count, 5);
});

test('a failed open is shared by concurrent callers and is retriable', async (t) => {
  const adapter = createAdapter();
  t.after(() => adapter.sqlite.close());
  let opens = 0;
  const load = databaseModules(adapter, async () => {
    opens++;
    if (opens === 1) throw new Error('Simulated open failure');
    return adapter;
  });
  const api = load('src/storage/database.ts');
  const attempts = await Promise.allSettled([api.getDatabase(), api.getDatabase(), api.initializeDatabase()]);
  assert.equal(opens, 1);
  assert.ok(attempts.every((result) => result.status === 'rejected'));
  await api.getDatabase();
  assert.equal(opens, 2);
});

test('version 1 startup does not rerun baseline DDL; newer databases are never downgraded', async (t) => {
  const adapter = createAdapter();
  t.after(() => adapter.sqlite.close());
  await createLegacyDatabase(adapter);
  adapter.sqlite.exec('PRAGMA user_version = 1');
  adapter.operations.length = 0;
  await databaseModules(adapter)('src/storage/database.ts').initializeDatabase();
  assert.ok(!adapter.operations.some((sql) => /CREATE TABLE|INSERT|UPDATE|DELETE|DROP/.test(sql)));
  const recordsBefore = snapshot(adapter.sqlite);
  adapter.sqlite.exec('PRAGMA user_version = 2');
  await assert.rejects(databaseModules(adapter)('src/storage/database.ts').initializeDatabase(), /newer version/);
  assert.equal(adapter.sqlite.prepare('PRAGMA user_version').get().user_version, 2);
  assert.deepEqual(snapshot(adapter.sqlite), recordsBefore);
});

test('services and repositories persist member IDs and correct currency on new records and explicit edits', async (t) => {
  const adapter = createAdapter();
  t.after(() => adapter.sqlite.close());
  const load = databaseModules(adapter);
  await load('src/storage/database.ts').initializeDatabase();
  const householdService = load('src/services/householdService.ts').HouseholdService;
  const householdRepository = load('src/storage/repositories/householdRepository.ts').HouseholdRepository;
  const household = await householdRepository.getHousehold();

  t.mock.method(Date, 'now', () => 1234567890);
  let sequence = 0;
  t.mock.method(Math, 'random', () => ++sequence / 1000);
  await Promise.all(Array.from({ length: 20 }, (_, index) => householdService.addNewMember(household.id, `Member ${index}`)));
  const members = await householdRepository.getMembers(household.id);
  const added = members.filter((member) => member.id !== 'member-1');
  assert.equal(added.length, 20);
  assert.equal(new Set(added.map((member) => member.id)).size, 20);
  assert.ok(added.every((member) => /^member-1234567890-[a-z0-9]+$/.test(member.id)));

  const memberId = added[0].id;
  const expenseService = load('src/services/expenseService.ts').ExpenseService;
  const billService = load('src/services/billService.ts').BillService;
  const groceryRepository = load('src/storage/repositories/groceryRepository.ts').GroceryRepository;
  const groceryService = load('src/services/groceryService.ts').GroceryService;
  const list = await groceryRepository.getDefaultList(household.id);
  const expense = await expenseService.addExpense(household.id, 'cat-food', 'Groceries', 300, memberId, 100, undefined, '?');
  const bill = await billService.addBill(household.id, 'Gas', 900, 100, 'Utilities', undefined, 'monthly', '?');
  const grocery = await groceryService.addGroceryItem(list.id, 'Rice', '1 kg', 'Grains', memberId);
  const unassigned = await groceryService.addGroceryItem(list.id, 'Milk', '1', 'Dairy');
  assert.equal(adapter.sqlite.prepare('SELECT paidBy FROM expenses WHERE id = ?').get(expense.id).paidBy, memberId);
  assert.equal(adapter.sqlite.prepare('SELECT assignedTo FROM grocery_items WHERE id = ?').get(grocery.id).assignedTo, memberId);
  assert.equal((await groceryRepository.getItems(list.id)).find((item) => item.id === unassigned.id).assignedTo, undefined);
  assert.equal(adapter.sqlite.prepare('SELECT currency FROM expenses WHERE id = ?').get(expense.id).currency, '৳');
  assert.equal(adapter.sqlite.prepare('SELECT currency FROM bills WHERE id = ?').get(bill.id).currency, '৳');
  await householdService.updateHouseholdName(household.id, 'My Home', '?');
  assert.equal(adapter.sqlite.prepare('SELECT currency FROM households WHERE id = ?').get(household.id).currency, '৳');
  await expenseService.updateExpense({ ...expense, title: 'Edited', currency: '?' });
  assert.equal(adapter.sqlite.prepare('SELECT currency, paidBy FROM expenses WHERE id = ?').get(expense.id).currency, '৳');
  assert.equal(adapter.sqlite.prepare('SELECT currency, paidBy FROM expenses WHERE id = ?').get(expense.id).paidBy, memberId);
});

test('currency formatting normalizes only known corruption, and member display never guesses from names', () => {
  const load = createLoader();
  const { formatCurrency, normalizeCurrencySymbol } = load('src/utils/currency.ts');
  assert.equal(formatCurrency(1234.5), '৳1,234.5');
  assert.equal(formatCurrency(10, '?'), '৳10');
  assert.equal(normalizeCurrencySymbol(null), '৳');
  assert.equal(normalizeCurrencySymbol(''), '৳');
  assert.equal(normalizeCurrencySymbol('$'), '$');
  assert.equal(formatCurrency(10, '€'), '€10');
  const { getMemberDisplayName } = load('src/utils/members.ts');
  const members = [{ id: 'member-1', name: 'Shovon' }, { id: 'member-2', name: 'Shovon' }];
  assert.equal(getMemberDisplayName('member-1', members), 'Shovon');
  assert.equal(getMemberDisplayName('Shovon', members), 'Shovon');
  assert.equal(getMemberDisplayName('removed-id', members), 'removed-id');
  assert.equal(getMemberDisplayName(undefined, members), '');
});
