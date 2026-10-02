import { CalendarRepository } from '../storage/repositories/calendarRepository';
import { ImportantDate } from '../types';

export const CalendarService = {
  async loadImportantDates(householdId: string): Promise<ImportantDate[]> {
    return await CalendarRepository.getImportantDates(householdId);
  },

  async addImportantDate(
    householdId: string,
    title: string,
    date: number,
    category: 'birthday' | 'anniversary' | 'event',
    isRecurringYearly: boolean = true
  ): Promise<ImportantDate> {
    const newItem: ImportantDate = {
      id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      householdId,
      title: title.trim(),
      date,
      isRecurringYearly,
      category,
      createdAt: Date.now(),
    };
    await CalendarRepository.addImportantDate(newItem);
    return newItem;
  },

  async updateImportantDate(item: ImportantDate): Promise<void> {
    await CalendarRepository.updateImportantDate(item);
  },

  async deleteImportantDate(itemId: string): Promise<void> {
    await CalendarRepository.deleteImportantDate(itemId);
  },
};
