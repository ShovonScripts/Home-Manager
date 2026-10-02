import { getDatabase } from '../database';
import { normalizeCurrencySymbol } from '../../utils/currency';
import { Bill } from '../../types';

export const BillRepository = {
  async getBills(householdId: string): Promise<Bill[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM bills WHERE householdId = ? ORDER BY isPaid ASC, dueDate ASC, createdAt DESC',
      [householdId]
    );

    return rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      currency: normalizeCurrencySymbol(row.currency),
      isPaid: Boolean(row.isPaid),
    }));
  },

  async addBill(bill: Bill): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO bills (id, householdId, title, amount, currency, dueDate, isPaid, category, recurrence, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        bill.id,
        bill.householdId,
        bill.title,
        bill.amount,
        normalizeCurrencySymbol(bill.currency),
        bill.dueDate,
        bill.isPaid ? 1 : 0,
        bill.category,
        bill.recurrence || 'monthly',
        bill.notes || null,
        bill.createdAt || now,
        now,
      ]
    );
  },

  async updateBill(bill: Bill): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE bills SET title = ?, amount = ?, currency = ?, dueDate = ?, isPaid = ?, category = ?, recurrence = ?, notes = ?, updatedAt = ? WHERE id = ?',
      [
        bill.title,
        bill.amount,
        normalizeCurrencySymbol(bill.currency),
        bill.dueDate,
        bill.isPaid ? 1 : 0,
        bill.category,
        bill.recurrence || 'monthly',
        bill.notes || null,
        now,
        bill.id,
      ]
    );
  },

  async deleteBill(billId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM bills WHERE id = ?', [billId]);
  },

  async setBillPaidStatus(billId: string, isPaid: boolean): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync('UPDATE bills SET isPaid = ?, updatedAt = ? WHERE id = ?', [
      isPaid ? 1 : 0,
      now,
      billId,
    ]);
  },
};
