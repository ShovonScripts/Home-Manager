import { HouseholdRepository } from '../storage/repositories/householdRepository';
import { Household, HouseholdMember } from '../types';

export const HouseholdService = {
  async loadHouseholdData(): Promise<{ household: Household | null; members: HouseholdMember[] }> {
    const household = await HouseholdRepository.getHousehold();
    let members: HouseholdMember[] = [];
    if (household) {
      members = await HouseholdRepository.getMembers(household.id);
    }
    return { household, members };
  },

  async updateHouseholdName(householdId: string, name: string, currency: string): Promise<void> {
    await HouseholdRepository.updateHousehold({ id: householdId, name, currency });
  },

  async addNewMember(householdId: string, name: string, role: 'admin' | 'member' | 'child' = 'member'): Promise<void> {
    const now = Date.now();
    const newMember: HouseholdMember = {
      id: `member-${now}-${Math.random().toString(36).slice(2, 10)}`,
      householdId,
      name,
      role,
      createdAt: now,
    };
    await HouseholdRepository.addMember(newMember);
  },

  async removeMember(memberId: string): Promise<void> {
    await HouseholdRepository.removeMember(memberId);
  },
};
