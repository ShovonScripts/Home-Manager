import * as SQLite from 'expo-sqlite';
import { migrateDatabase } from './migrations';

// Cache the in-flight open, not just its result, so concurrent callers share one connection.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<void> | null = null;

const openDatabase = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('homemanager.db').catch((error: unknown) => {
      dbPromise = null; // A failed open can be retried without keeping a rejected promise.
      throw error;
    });
  }
  return dbPromise;
};

export const initializeDatabase = (): Promise<void> => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const db = await openDatabase();
      await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      await migrateDatabase(db);

      // Keep first-run seeds atomic. A failed seed cannot leave a partial household behind.
      await db.withTransactionAsync(async () => {
        await seedDatabase(db);
      });
    })().catch((error: unknown) => {
      initializationPromise = null;
      throw error;
    });
  }
  return initializationPromise;
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // The startup gate initializes eagerly; this also protects any standalone repository call.
  await initializeDatabase();
  return openDatabase();
};

const seedDatabase = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  // Preserve the existing first-run seeds. Existing households and records are never replaced.
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
