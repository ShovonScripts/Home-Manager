import type { SQLiteDatabase } from 'expo-sqlite';

interface Migration {
  version: number;
  apply: (db: SQLiteDatabase) => Promise<void>;
}

// Version 1 is the existing schema, not a redesign. IF NOT EXISTS safely adopts
// unversioned installations without changing their tables, columns, or records.
// Append future migrations in order (2, 3, ...); never edit an applied migration.
const migrations: readonly Migration[] = [
  {
    version: 1,
    apply: async (db) => {
      await db.execAsync(`
    -- Households (Cloud-sync ready with updatedAt)
    CREATE TABLE IF NOT EXISTS households (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT '৳',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- Household Members
    CREATE TABLE IF NOT EXISTS household_members (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member', 'child'
      avatarUrl TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_members_household ON household_members(householdId);

    -- Grocery Lists
    CREATE TABLE IF NOT EXISTS grocery_lists (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      name TEXT NOT NULL,
      isArchived INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_grocery_lists_household ON grocery_lists(householdId);

    -- Grocery Items
    CREATE TABLE IF NOT EXISTS grocery_items (
      id TEXT PRIMARY KEY NOT NULL,
      listId TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL DEFAULT '1',
      category TEXT NOT NULL DEFAULT 'General',
      isCompleted INTEGER NOT NULL DEFAULT 0,
      assignedTo TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (listId) REFERENCES grocery_lists (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_grocery_items_list ON grocery_items(listId);

    -- Expense Categories
    CREATE TABLE IF NOT EXISTS expense_categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- Expenses
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT '৳',
      paidBy TEXT NOT NULL,
      date INTEGER NOT NULL,
      notes TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES expense_categories (id)
    );
    CREATE INDEX IF NOT EXISTS idx_expenses_household ON expenses(householdId);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

    -- Bills
    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT '৳',
      dueDate INTEGER NOT NULL,
      isPaid INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      recurrence TEXT NOT NULL DEFAULT 'monthly', -- 'none', 'monthly', 'yearly'
      notes TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_bills_household ON bills(householdId);
    CREATE INDEX IF NOT EXISTS idx_bills_duedate ON bills(dueDate);

    -- Task Categories
    CREATE TABLE IF NOT EXISTS task_categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- Tasks & Chores
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      categoryId TEXT NOT NULL,
      assignedTo TEXT,
      dueDate INTEGER,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_household ON tasks(householdId);
    CREATE INDEX IF NOT EXISTS idx_tasks_duedate ON tasks(dueDate);

    -- Reminders (Medicine & General)
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      dateTime INTEGER NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'general', -- 'medicine', 'general'
      targetMemberId TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_reminders_household ON reminders(householdId);
    CREATE INDEX IF NOT EXISTS idx_reminders_datetime ON reminders(dateTime);

    -- Important Dates / Calendar Events
    CREATE TABLE IF NOT EXISTS important_dates (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      date INTEGER NOT NULL,
      isRecurringYearly INTEGER NOT NULL DEFAULT 1,
      category TEXT NOT NULL DEFAULT 'event', -- 'birthday', 'anniversary', 'event'
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_important_dates_household ON important_dates(householdId);

    -- Shared Notes
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (householdId) REFERENCES households (id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_notes_household ON notes(householdId);
      `);
    },
  },
];

export const migrateDatabase = async (db: SQLiteDatabase): Promise<void> => {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;
  const latestVersion = migrations[migrations.length - 1].version;

  // An older app must not downgrade or write to a newer, potentially incompatible schema.
  if (currentVersion > latestVersion) {
    throw new Error('This database needs a newer version of Home Manager. Please update the app.');
  }

  for (const migration of migrations) {
    if (migration.version <= currentVersion) continue;
    if (migration.version !== currentVersion + 1) {
      throw new Error('Database migrations must be applied sequentially.');
    }

    // Startup blocks repository access, so no unrelated queries can join this transaction.
    // Commit the version only with the schema; a failure rolls both back for a safe retry.
    await db.withTransactionAsync(async () => {
      await migration.apply(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    currentVersion = migration.version;
  }
};
