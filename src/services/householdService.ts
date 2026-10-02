import { HouseholdRepository } from '../storage/repositories/householdRepository';
import { Household, HouseholdMember } from '../types';
import { initializeDatabase } from '../storage/database';

export const HouseholdService = {
  async loadHouseholdData(): Promise<{ household: Household | null; members: HouseholdMember[] }> {
    await initializeDatabase();
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

  async addNewMember(
    householdId: string,
    name: string,
    role: 'admin' | 'member' | 'child' = 'member',
    whatsapp?: string
  ): Promise<void> {
    const newMember: HouseholdMember = {
      id: `member-${Date.now()}`,
      householdId,
      name,
      role,
      whatsapp: whatsapp?.trim() || undefined,
      createdAt: Date.now(),
    };
    await HouseholdRepository.addMember(newMember);
  },

  async updateMember(member: HouseholdMember): Promise<void> {
    await HouseholdRepository.updateMember(member);
  },

  async removeMember(memberId: string): Promise<void> {
    await HouseholdRepository.removeMember(memberId);
  },
};
