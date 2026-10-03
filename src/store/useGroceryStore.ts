import { create } from 'zustand';
import { GroceryList, GroceryItem } from '../types';
import { getDatabase } from '../storage/database';

interface GroceryState {
  lists: GroceryList[];
  items: GroceryItem[];
  activeListId: string | null;
  isLoading: boolean;
  error: string | null;

  loadData: (householdId: string) => Promise<void>;
  setActiveList: (listId: string) => void;
  createList: (householdId: string, name: string) => Promise<void>;
  addItem: (listId: string, name: string, quantity?: string, category?: string, assignedTo?: string) => Promise<void>;
  updateItem: (item: GroceryItem) => Promise<void>;
  toggleItem: (itemId: string, currentStatus: boolean) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
}

export const useGroceryStore = create<GroceryState>((set, get) => ({
  lists: [],
  items: [],
  activeListId: null,
  isLoading: true,
  error: null,

  loadData: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();

      const lists = await db.getAllAsync<GroceryList>(
        'SELECT * FROM grocery_lists WHERE householdId = ? AND isArchived = 0 ORDER BY createdAt DESC',
        [householdId]
      );

      const items = await db.getAllAsync<any>(
        'SELECT * FROM grocery_items WHERE listId IN (SELECT id FROM grocery_lists WHERE householdId = ? AND isArchived = 0) ORDER BY isCompleted ASC, createdAt DESC',
        [householdId]
      );

      const parsedItems = items.map(item => ({
        ...item,
        isCompleted: Boolean(item.isCompleted)
      }));

      const activeListId = get().activeListId || (lists.length > 0 ? lists[0].id : null);

      set({ lists, items: parsedItems, activeListId, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load grocery data', isLoading: false });
    }
  },

  setActiveList: (listId: string) => set({ activeListId: listId }),

  createList: async (householdId: string, name: string) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const newList: GroceryList = {
        id: `glist-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId,
        name: name.trim(),
        isArchived: false,
        createdAt: now,
      };

      await db.runAsync(
        'INSERT INTO grocery_lists (id, householdId, name, isArchived, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [newList.id, newList.householdId, newList.name, 0, newList.createdAt, now]
      );

      set((state) => ({
        lists: [newList, ...state.lists],
        activeListId: newList.id
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to create list' });
    }
  },

  addItem: async (listId: string, name: string, quantity = '1', category = 'General', assignedTo?: string) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const newItem: GroceryItem = {
        id: `gitem-${now}-${Math.random().toString(36).substr(2, 4)}`,
        listId,
        name: name.trim(),
        quantity: quantity.trim() || '1',
        category,
        isCompleted: false,
        assignedTo: assignedTo || undefined,
        createdAt: now,
      };

      await db.runAsync(
        'INSERT INTO grocery_items (id, listId, name, quantity, category, isCompleted, assignedTo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newItem.id, newItem.listId, newItem.name, newItem.quantity, newItem.category, 0, newItem.assignedTo || null, newItem.createdAt, now]
      );

      set((state) => ({ items: [newItem, ...state.items] }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add item' });
    }
  },

  updateItem: async (item: GroceryItem) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      await db.runAsync(
        'UPDATE grocery_items SET name = ?, quantity = ?, category = ?, assignedTo = ?, updatedAt = ? WHERE id = ?',
        [item.name.trim(), item.quantity.trim() || '1', item.category, item.assignedTo || null, now, item.id]
      );

      set((state) => ({
        items: state.items.map((i) => (i.id === item.id ? item : i)),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update item' });
    }
  },

  toggleItem: async (itemId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, isCompleted: newStatus } : item
      ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
    }));

    try {
      const db = await getDatabase();
      await db.runAsync('UPDATE grocery_items SET isCompleted = ?, updatedAt = ? WHERE id = ?', [
        newStatus ? 1 : 0,
        Date.now(),
        itemId,
      ]);
    } catch (err: any) {
      // Revert on failure
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, isCompleted: currentStatus } : item
        ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)),
        error: err?.message || 'Failed to toggle item',
      }));
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM grocery_items WHERE id = ?', [itemId]);
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete item' });
    }
  },

  deleteList: async (listId: string) => {
    try {
      const db = await getDatabase();
      // Items will be cascade deleted by SQLite foreign keys, but we update UI state here
      await db.runAsync('DELETE FROM grocery_lists WHERE id = ?', [listId]);

      set((state) => {
        const remainingLists = state.lists.filter((l) => l.id !== listId);
        return {
          lists: remainingLists,
          items: state.items.filter((i) => i.listId !== listId),
          activeListId: remainingLists.length > 0 ? remainingLists[0].id : null
        };
      });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete list' });
    }
  },
}));

// Helper hooks for components
export const useActiveListItems = () => {
  const items = useGroceryStore((state) => state.items);
  const activeListId = useGroceryStore((state) => state.activeListId);
  return items.filter((item) => item.listId === activeListId);
};
