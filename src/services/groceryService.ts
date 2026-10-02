import { GroceryRepository } from '../storage/repositories/groceryRepository';
import { GroceryList, GroceryItem } from '../types';

export const GroceryService = {
  async getActiveListAndItems(householdId: string): Promise<{ list: GroceryList; items: GroceryItem[] }> {
    const list = await GroceryRepository.getDefaultList(householdId);
    const items = await GroceryRepository.getItems(list.id);
    return { list, items };
  },

  async addGroceryItem(
    listId: string,
    name: string,
    quantity: string,
    category: string,
    assignedTo?: string
  ): Promise<GroceryItem> {
    const newItem: GroceryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      listId,
      name,
      quantity: quantity.trim() || '1',
      category: category || 'Other',
      isCompleted: false,
      assignedTo: assignedTo || undefined,
      createdAt: Date.now(),
    };
    await GroceryRepository.addItem(newItem);
    return newItem;
  },

  async updateGroceryItem(item: GroceryItem): Promise<void> {
    await GroceryRepository.updateItem(item);
  },

  async deleteGroceryItem(itemId: string): Promise<void> {
    await GroceryRepository.deleteItem(itemId);
  },

  async toggleGroceryItem(itemId: string, currentStatus: boolean): Promise<void> {
    await GroceryRepository.toggleItem(itemId, !currentStatus);
  },

  async clearCompletedItems(listId: string): Promise<void> {
    await GroceryRepository.clearCompleted(listId);
  },
};
