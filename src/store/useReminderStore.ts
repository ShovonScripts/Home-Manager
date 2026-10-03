import { create } from 'zustand';
import { Reminder } from '../types';
import { getDatabase } from '../storage/database';
import { NotificationService } from '../services/notificationService';

interface ReminderState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;

  loadData: (householdId: string) => Promise<void>;
  addReminder: (
    householdId: string,
    title: string,
    dateTime: number,
    type: 'medicine' | 'general',
    targetMemberId?: string
  ) => Promise<void>;
  toggleReminder: (reminderId: string, currentStatus: boolean) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isLoading: true,
  error: null,

  loadData: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();

      const remindersData = await db.getAllAsync<any>(
        'SELECT * FROM reminders WHERE householdId = ? ORDER BY isCompleted ASC, dateTime ASC',
        [householdId]
      );

      const parsedReminders = remindersData.map(r => ({
        ...r,
        isCompleted: Boolean(r.isCompleted)
      }));

      set({ reminders: parsedReminders, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load reminders', isLoading: false });
    }
  },

  addReminder: async (householdId, title, dateTime, type, targetMemberId) => {
    try {
      // 1. Schedule the notification locally
      const notificationId = await NotificationService.scheduleNotification(
        type === 'medicine' ? '💊 Medicine Reminder' : '🔔 Reminder',
        title,
        new Date(dateTime),
        { route: '/reminders' }
      );

      const db = await getDatabase();
      const now = Date.now();
      const newReminder: Reminder = {
        id: `rem-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId,
        title: title.trim(),
        dateTime,
        isCompleted: false,
        type,
        targetMemberId,
        notificationId: notificationId || undefined,
        createdAt: now,
      };

      await db.runAsync(
        'INSERT INTO reminders (id, householdId, title, dateTime, isCompleted, type, targetMemberId, notificationId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newReminder.id, newReminder.householdId, newReminder.title, newReminder.dateTime, 0, newReminder.type, newReminder.targetMemberId || null, newReminder.notificationId || null, newReminder.createdAt, now]
      );

      set((state) => ({
        reminders: [newReminder, ...state.reminders].sort((a, b) => {
          if (a.isCompleted === b.isCompleted) return a.dateTime - b.dateTime;
          return a.isCompleted ? 1 : -1;
        })
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add reminder' });
    }
  },

  toggleReminder: async (reminderId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === reminderId ? { ...r, isCompleted: newStatus } : r
      ).sort((a, b) => {
        if (a.isCompleted === b.isCompleted) return a.dateTime - b.dateTime;
        return a.isCompleted ? 1 : -1;
      })
    }));

    try {
      const db = await getDatabase();
      await db.runAsync('UPDATE reminders SET isCompleted = ?, updatedAt = ? WHERE id = ?', [
        newStatus ? 1 : 0,
        Date.now(),
        reminderId,
      ]);
    } catch (err: any) {
      set((state) => ({
        reminders: state.reminders.map((r) =>
          r.id === reminderId ? { ...r, isCompleted: currentStatus } : r
        ).sort((a, b) => {
          if (a.isCompleted === b.isCompleted) return a.dateTime - b.dateTime;
          return a.isCompleted ? 1 : -1;
        }),
        error: err?.message || 'Failed to toggle reminder',
      }));
    }
  },

  deleteReminder: async (reminderId: string) => {
    try {
      const state = get();
      const reminderToDelete = state.reminders.find(r => r.id === reminderId);

      // Cancel the scheduled push notification if it exists
      if (reminderToDelete?.notificationId) {
        await NotificationService.cancelNotification(reminderToDelete.notificationId);
      }

      const db = await getDatabase();
      await db.runAsync('DELETE FROM reminders WHERE id = ?', [reminderId]);
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== reminderId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete reminder' });
    }
  },
}));
