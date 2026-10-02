import { getDatabase } from '../database';
import { Expense, ExpenseCategory } from '../../types';

export const ExpenseRepository = {
  async getCategories(): Promise<ExpenseCategory[]> {
    const db = await getDatabase();
    return await db.getAllAsync<ExpenseCategory>('SELECT * FROM expense_categories ORDER BY name ASC');
  },

  async getExpenses(householdId: string): Promise<Expense[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM expenses WHERE householdId = ? ORDER BY date DESC, createdAt DESC',
      [householdId]
    );

    return rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
    }));
  },

  async addExpense(expense: Expense): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO expenses (id, householdId, categoryId, title, amount, currency, paidBy, date, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        expense.id,
        expense.householdId,
        expense.categoryId,
        expense.title,
        expense.amount,
        expense.currency || '৳',
        expense.paidBy,
        expense.date,
        expense.notes || null,
        expense.createdAt || now,
        now,
      ]
    );
  },

  async updateExpense(expense: Expense): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE expenses SET categoryId = ?, title = ?, amount = ?, paidBy = ?, date = ?, notes = ?, updatedAt = ? WHERE id = ?',
      [
        expense.categoryId,
        expense.title,
        expense.amount,
        expense.paidBy,
        expense.date,
        expense.notes || null,
        now,
        expense.id,
      ]
    );
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
  },
};
