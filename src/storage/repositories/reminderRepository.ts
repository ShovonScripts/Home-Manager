import { getDatabase } from '../database';
import { Reminder } from '../../types';

export const ReminderRepository = {
  async getReminders(householdId: string): Promise<Reminder[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM reminders WHERE householdId = ? ORDER BY isCompleted ASC, dateTime ASC, createdAt DESC',
      [householdId]
    );

    return rows.map((row) => ({
      ...row,
      isCompleted: Boolean(row.isCompleted),
    }));
  },

  async addReminder(reminder: Reminder): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO reminders (id, householdId, title, dateTime, isCompleted, type, targetMemberId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reminder.id,
        reminder.householdId,
        reminder.title,
        reminder.dateTime,
        reminder.isCompleted ? 1 : 0,
        reminder.type || 'general',
        reminder.targetMemberId || null,
        reminder.createdAt || now,
        now,
      ]
    );
  },

  async updateReminder(reminder: Reminder): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE reminders SET title = ?, dateTime = ?, isCompleted = ?, type = ?, targetMemberId = ?, updatedAt = ? WHERE id = ?',
      [
        reminder.title,
        reminder.dateTime,
        reminder.isCompleted ? 1 : 0,
        reminder.type || 'general',
        reminder.targetMemberId || null,
        now,
        reminder.id,
      ]
    );
  },

  async deleteReminder(reminderId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM reminders WHERE id = ?', [reminderId]);
  },

  async toggleReminder(reminderId: string, isCompleted: boolean): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync('UPDATE reminders SET isCompleted = ?, updatedAt = ? WHERE id = ?', [
      isCompleted ? 1 : 0,
      now,
      reminderId,
    ]);
  },
};
