import { getDatabase } from '../database';
import { GroceryList, GroceryItem } from '../../types';

export const GroceryRepository = {
  async getDefaultList(householdId: string): Promise<GroceryList> {
    const db = await getDatabase();
    let list = await db.getFirstAsync<GroceryList>(
      'SELECT * FROM grocery_lists WHERE householdId = ? AND isArchived = 0 LIMIT 1',
      [householdId]
    );

    if (!list) {
      const listId = `list-${Date.now()}`;
      const now = Date.now();
      await db.runAsync(
        'INSERT INTO grocery_lists (id, householdId, name, isArchived, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?)',
        [listId, householdId, 'Main Grocery List', now, now]
      );
      list = {
        id: listId,
        householdId,
        name: 'Main Grocery List',
        isArchived: false,
        createdAt: now,
      };
    }

    return list;
  },

  async getItems(listId: string): Promise<GroceryItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM grocery_items WHERE listId = ? ORDER BY createdAt DESC',
      [listId]
    );

    return rows.map((row) => ({
      ...row,
      isCompleted: Boolean(row.isCompleted),
      assignedTo: row.assignedTo || undefined,
    }));
  },

  async addItem(item: GroceryItem): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO grocery_items (id, listId, name, quantity, category, isCompleted, assignedTo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        item.id,
        item.listId,
        item.name,
        item.quantity,
        item.category,
        item.isCompleted ? 1 : 0,
        item.assignedTo || null,
        item.createdAt || now,
        now,
      ]
    );
  },

  async updateItem(item: GroceryItem): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE grocery_items SET name = ?, quantity = ?, category = ?, isCompleted = ?, assignedTo = ?, updatedAt = ? WHERE id = ?',
      [
        item.name,
        item.quantity,
        item.category,
        item.isCompleted ? 1 : 0,
        item.assignedTo || null,
        now,
        item.id,
      ]
    );
  },

  async deleteItem(itemId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM grocery_items WHERE id = ?', [itemId]);
  },

  async toggleItem(itemId: string, isCompleted: boolean): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync('UPDATE grocery_items SET isCompleted = ?, updatedAt = ? WHERE id = ?', [
      isCompleted ? 1 : 0,
      now,
      itemId,
    ]);
  },

  async clearCompleted(listId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM grocery_items WHERE listId = ? AND isCompleted = 1', [listId]);
  },
};
