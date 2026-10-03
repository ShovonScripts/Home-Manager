import { create } from 'zustand';
import { Expense, ExpenseCategory } from '../types';
import { getDatabase } from '../storage/database';

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  isLoading: boolean;
  error: string | null;

  loadData: (householdId: string) => Promise<void>;
  addExpense: (
    householdId: string,
    categoryId: string,
    title: string,
    amount: number,
    currency: string,
    paidBy: string,
    date: number,
    notes?: string
  ) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  isLoading: true,
  error: null,

  loadData: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();

      const expenses = await db.getAllAsync<Expense>(
        'SELECT * FROM expenses WHERE householdId = ? ORDER BY date DESC, createdAt DESC',
        [householdId]
      );

      const categories = await db.getAllAsync<ExpenseCategory>(
        'SELECT * FROM expense_categories ORDER BY name ASC'
      );

      set({ expenses, categories, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load expenses', isLoading: false });
    }
  },

  addExpense: async (householdId, categoryId, title, amount, currency, paidBy, date, notes) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const newExpense: Expense = {
        id: `exp-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId,
        categoryId,
        title: title.trim(),
        amount,
        currency,
        paidBy,
        date,
        notes: notes?.trim() || undefined,
        createdAt: now,
      };

      await db.runAsync(
        'INSERT INTO expenses (id, householdId, categoryId, title, amount, currency, paidBy, date, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newExpense.id, newExpense.householdId, newExpense.categoryId, newExpense.title, newExpense.amount, newExpense.currency, newExpense.paidBy, newExpense.date, newExpense.notes || null, newExpense.createdAt, now]
      );

      set((state) => ({
        expenses: [newExpense, ...state.expenses].sort((a, b) => b.date - a.date)
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add expense' });
    }
  },

  deleteExpense: async (expenseId: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM expenses WHERE id = ?', [expenseId]);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== expenseId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete expense' });
    }
  },
}));
