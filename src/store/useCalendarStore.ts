import { create } from 'zustand';
import { ImportantDate } from '../types';
import { getDatabase } from '../storage/database';

interface CalendarState {
  events: ImportantDate[];
  isLoading: boolean;
  error: string | null;

  loadData: (householdId: string) => Promise<void>;
  addEvent: (
    householdId: string,
    title: string,
    date: number,
    isRecurringYearly: boolean,
    category: 'birthday' | 'anniversary' | 'event'
  ) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: true,
  error: null,

  loadData: async (householdId: string) => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();

      const eventsData = await db.getAllAsync<any>(
        'SELECT * FROM important_dates WHERE householdId = ? ORDER BY date ASC',
        [householdId]
      );

      const parsedEvents = eventsData.map(e => ({
        ...e,
        isRecurringYearly: Boolean(e.isRecurringYearly)
      }));

      set({ events: parsedEvents, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load calendar events', isLoading: false });
    }
  },

  addEvent: async (householdId, title, date, isRecurringYearly, category) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const newEvent: ImportantDate = {
        id: `evt-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId,
        title: title.trim(),
        date,
        isRecurringYearly,
        category,
        createdAt: now,
      };

      await db.runAsync(
        'INSERT INTO important_dates (id, householdId, title, date, isRecurringYearly, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newEvent.id, newEvent.householdId, newEvent.title, newEvent.date, newEvent.isRecurringYearly ? 1 : 0, newEvent.category, newEvent.createdAt, now]
      );

      set((state) => ({
        events: [newEvent, ...state.events].sort((a, b) => a.date - b.date)
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add event' });
    }
  },

  deleteEvent: async (eventId: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM important_dates WHERE id = ?', [eventId]);
      set((state) => ({
        events: state.events.filter((e) => e.id !== eventId),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to delete event' });
    }
  },
}));
