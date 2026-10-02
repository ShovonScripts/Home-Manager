import { getDatabase } from '../database';
import { normalizeCurrencySymbol } from '../../utils/currency';
import { Household, HouseholdMember } from '../../types';

export const HouseholdRepository = {
  async getHousehold(): Promise<Household | null> {
    const db = await getDatabase();
    const household = await db.getFirstAsync<Household>('SELECT * FROM households LIMIT 1');
    return household ? { ...household, currency: normalizeCurrencySymbol(household.currency) } : null;
  },

  async getMembers(householdId: string): Promise<HouseholdMember[]> {
    const db = await getDatabase();
    return await db.getAllAsync<HouseholdMember>(
      'SELECT * FROM household_members WHERE householdId = ? ORDER BY createdAt ASC',
      [householdId]
    );
  },

  async updateHousehold(household: Partial<Household>): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    if (household.name && household.id) {
      await db.runAsync(
        'UPDATE households SET name = ?, currency = ?, updatedAt = ? WHERE id = ?',
        [household.name, normalizeCurrencySymbol(household.currency), now, household.id]
      );
    }
  },

  async addMember(member: HouseholdMember): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO household_members (id, householdId, name, role, avatarUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [member.id, member.householdId, member.name, member.role, member.avatarUrl || null, member.createdAt || now, now]
    );
  },

  async removeMember(memberId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM household_members WHERE id = ?', [memberId]);
  },
};
