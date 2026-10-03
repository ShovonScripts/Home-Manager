import { create } from 'zustand';
import { Bill } from '../types';
import { getDatabase } from '../storage/database';

interface BillState {
  bills: Bill[];
  isLoading: boolean;
  error: string | null;

  loadData: (householdId: string) => Promise<void>;
  addBill: (
    householdId: string,
    title: string,
    amount: number,
    currency: string,
    dueDate: number,
    category: string,
    recurrence: 'none' | 'monthly' | 'yearly',
    notes?: string
  ) => Promise<void>;
  toggleBillPaid: (billId: string, currentStatus: boolean) => Promise<void>;
  deleteBill: (billId: string) => Promise<void>;
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  isLoading: true,
  error: null,

  loadData: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();

      const billsData = await db.getAllAsync<any>(
        'SELECT * FROM bills WHERE householdId = ? ORDER BY isPaid ASC, dueDate ASC, createdAt DESC',
        [householdId]
      );

      const parsedBills = billsData.map(b => ({
        ...b,
        isPaid: Boolean(b.isPaid)
      }));

      set({ bills: parsedBills, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load bills', isLoading: false });
    }
  },

  addBill: async (householdId, title, amount, currency, dueDate, category, recurrence, notes) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const newBill: Bill = {
        id: `bill-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId,
        title: title.trim(),
        amount,
        currency,
        dueDate,
        isPaid: false,
        category,
        recurrence,
        notes: notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      await db.runAsync(
        'INSERT INTO bills (id, householdId, title, amount, currency, dueDate, isPaid, category, recurrence, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newBill.id, newBill.householdId, newBill.title, newBill.amount, newBill.currency, newBill.dueDate, 0, newBill.category, newBill.recurrence, newBill.notes || null, newBill.createdAt, newBill.updatedAt]
      );

      set((state) => ({
        bills: [newBill, ...state.bills].sort((a, b) => {
          if (a.isPaid === b.isPaid) return a.dueDate - b.dueDate;
          return a.isPaid ? 1 : -1;
        })
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add bill' });
    }
  },

  toggleBillPaid: async (billId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === billId ? { ...b, isPaid: newStatus, updatedAt: Date.now() } : b
      ).sort((a, b) => {
        if (a.isPaid === b.isPaid) return a.dueDate - b.dueDate;
        return a.isPaid ? 1 : -1;
      })
    }));

    try {
      const db = await getDatabase();
      await db.runAsync('UPDATE bills SET isPaid = ?, updatedAt = ? WHERE id = ?', [
        newStatus ? 1 : 0,
        Date.now(),
        billId,
      ]);
    } catch (err: any) {
      set((state) => ({
        bills: state.bills.map((b) =>
          b.id === billId ? { ...b, isPaid: currentStatus } : b
        ).sort((a, b) => {
          if (a.isPaid === b.isPaid) return a.dueDate - b.dueDate;
          return a.isPaid ? 1 : -1;
        }),
        error: err?.message || 'Failed to toggle bill status',
      }));
    }
  },

  deleteBill: async (billId: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM bills WHERE id = ?', [billId]);
      set((state) => ({
        bills: state.bills.filter((b) => b.id !== billId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete bill' });
    }
  },
}));
