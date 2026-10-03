import { getDatabase } from '../database';
import { Household, HouseholdMember } from '../../types';

export const HouseholdRepository = {
  async getHousehold(): Promise<Household | null> {
    const db = await getDatabase();
    return await db.getFirstAsync<Household>('SELECT * FROM households LIMIT 1');
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
        [household.name, household.currency || '৳', now, household.id]
      );
    }
  },

  async addMember(member: HouseholdMember): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO household_members (id, householdId, name, role, avatarUrl, whatsapp, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [member.id, member.householdId, member.name, 'member', member.avatarUrl || null, member.whatsapp || null, member.color || null, member.createdAt || now, now]
    );
  },

  async updateMember(member: HouseholdMember): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      'UPDATE household_members SET name = ?, whatsapp = ?, color = ?, updatedAt = ? WHERE id = ?',
      [member.name, member.whatsapp || null, member.color || null, now, member.id]
    );
  },

  async removeMember(memberId: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM household_members WHERE id = ?', [memberId]);
  },
};
