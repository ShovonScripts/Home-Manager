import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync('homemanager.db');
  return dbInstance;
};

export const initializeDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

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

  // Safe idempotent seed data for first run
  const existingHousehold = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM households LIMIT 1'
  );

  if (!existingHousehold) {
    const defaultHouseholdId = 'household-default-1';
    const now = Date.now();

    await db.runAsync(
      'INSERT INTO households (id, name, currency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [defaultHouseholdId, 'My Sweet Home', '৳', now, now]
    );

    await db.runAsync(
      'INSERT INTO household_members (id, householdId, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      ['member-1', defaultHouseholdId, 'Primary User', 'admin', now, now]
    );

    // Seed default expense categories
    const categories = [
      ['cat-food', 'Food & Groceries', 'restaurant', '#FF7043', now, now],
      ['cat-bills', 'Utilities & Bills', 'flash', '#42A5F5', now, now],
      ['cat-rent', 'Rent & Housing', 'home', '#66BB6A', now, now],
      ['cat-transport', 'Transport', 'car', '#AB47BC', now, now],
      ['cat-other', 'Other Expenses', 'receipt', '#78909C', now, now],
    ];

    for (const cat of categories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO expense_categories (id, name, icon, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        cat
      );
    }

    // Seed default task categories
    const taskCategories = [
      ['tcat-chores', 'Household Chores', '#26A69A', now, now],
      ['tcat-maintenance', 'Maintenance', '#FFA726', now, now],
      ['tcat-shopping', 'Shopping', '#AB47BC', now, now],
    ];

    for (const tcat of taskCategories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO task_categories (id, name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        tcat
      );
    }
  }
};
