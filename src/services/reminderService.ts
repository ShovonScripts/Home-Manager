import { ReminderRepository } from '../storage/repositories/reminderRepository';
import { Reminder } from '../types';

export const ReminderService = {
  async loadReminders(householdId: string): Promise<Reminder[]> {
    return await ReminderRepository.getReminders(householdId);
  },

  async addReminder(
    householdId: string,
    title: string,
    dateTime: number,
    type: 'medicine' | 'general' = 'general',
    targetMemberId?: string
  ): Promise<Reminder> {
    const newReminder: Reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      householdId,
      title: title.trim(),
      dateTime,
      isCompleted: false,
      type,
      targetMemberId: targetMemberId || undefined,
      createdAt: Date.now(),
    };
    await ReminderRepository.addReminder(newReminder);
    return newReminder;
  },

  async updateReminder(reminder: Reminder): Promise<void> {
    await ReminderRepository.updateReminder(reminder);
  },

  async deleteReminder(reminderId: string): Promise<void> {
    await ReminderRepository.deleteReminder(reminderId);
  },

  async toggleReminder(reminderId: string, currentStatus: boolean): Promise<void> {
    await ReminderRepository.toggleReminder(reminderId, !currentStatus);
  },
};
