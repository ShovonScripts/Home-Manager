import { getDatabase } from '../database';
import { ImportantDate } from '../../types';

export const CalendarRepository = {
  async getImportantDates(householdId: string): Promise<ImportantDate[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM important_dates WHERE householdId = ? ORDER BY date ASC, createdAt DESC',
      [householdId]
    );

    return rows.map((row) => ({
      ...row,
      isRecurringYearly: Boolean(row.isRecurringYearly),
    }));
  },

  async addImportantDate(item: ImportantDate): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO important_dates (id, householdId, title, date, isRecurringYearly, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id,
        item.householdId,
        item.title,
        item.date,
        item.isRecurringYearly ? 1 : 0,
        item.category,
        item.createdAt || now,
        now,
      ]
    );
  },

  async updateImportantDate(item: ImportantDate): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE important_dates SET title = ?, date = ?, isRecurringYearly = ?, category = ?, updatedAt = ? WHERE id = ?',
      [
        item.title,
        item.date,
        item.isRecurringYearly ? 1 : 0,
        item.category,
        now,
        item.id,
      ]
    );
  },

  async deleteImportantDate(itemId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM important_dates WHERE id = ?', [itemId]);
  },
};
