import { create } from 'zustand';
import { Household, HouseholdMember } from '../types';
import { getDatabase } from '../storage/database';

interface HouseholdState {
  household: Household | null;
  members: HouseholdMember[];
  isLoading: boolean;
  error: string | null;

  loadHousehold: () => Promise<void>;
  addMember: (name: string, whatsapp?: string, color?: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMember: (memberId: string, name: string, whatsapp?: string, color?: string) => Promise<void>;
}

const MEMBER_COLORS = ['#42A5F5', '#66BB6A', '#AB47BC', '#FF7043', '#26A69A', '#EC407A', '#FFA726', '#78909C'];

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  household: null,
  members: [],
  isLoading: true,
  error: null,

  loadHousehold: async () => {
    try {
      set({ isLoading: true, error: null });
      const db = await getDatabase();
      const household = await db.getFirstAsync<Household>('SELECT * FROM households LIMIT 1');

      if (household) {
        const members = await db.getAllAsync<HouseholdMember>(
          'SELECT * FROM household_members WHERE householdId = ?',
          [household.id]
        );
        set({ household, members, isLoading: false });
      } else {
        set({ error: 'No household found', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err?.message || 'Failed to load household', isLoading: false });
    }
  },

  addMember: async (name: string, whatsapp?: string, color?: string) => {
    const { household, members } = get();
    if (!household) return;

    try {
      const db = await getDatabase();
      const now = Date.now();
      const assignedColor = color || MEMBER_COLORS[members.length % MEMBER_COLORS.length];

      const newMember: HouseholdMember = {
        id: `member-${now}-${Math.random().toString(36).substr(2, 4)}`,
        householdId: household.id,
        name: name.trim(),
        whatsapp: whatsapp?.trim(),
        color: assignedColor,
        createdAt: now,
      };

      await db.runAsync(
        'INSERT INTO household_members (id, householdId, name, role, whatsapp, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newMember.id, newMember.householdId, newMember.name, 'member', newMember.whatsapp || null, newMember.color || null, newMember.createdAt, now]
      );

      set((state) => ({ members: [...state.members, newMember] }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add member' });
    }
  },

  removeMember: async (memberId: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM household_members WHERE id = ?', [memberId]);
      set((state) => ({ members: state.members.filter((m) => m.id !== memberId) }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to remove member' });
    }
  },

  updateMember: async (memberId: string, name: string, whatsapp?: string, color?: string) => {
    try {
      const db = await getDatabase();
      const now = Date.now();
      const existing = get().members.find(m => m.id === memberId);
      const assignedColor = color || existing?.color || '#42A5F5';

      await db.runAsync(
        'UPDATE household_members SET name = ?, whatsapp = ?, color = ?, updatedAt = ? WHERE id = ?',
        [name.trim(), whatsapp?.trim() || null, assignedColor, now, memberId]
      );

      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, name: name.trim(), whatsapp: whatsapp?.trim(), color: assignedColor } : m
        ),
      }));
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update member' });
    }
  },
}));
