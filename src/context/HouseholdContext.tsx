import React, { createContext, useContext, useState, useEffect } from 'react';
import { Household, HouseholdMember } from '../types';
import { HouseholdService } from '../services/householdService';

interface HouseholdContextType {
  household: Household | null;
  members: HouseholdMember[];
  isLoading: boolean;
  error: string | null;
  refreshHousehold: () => Promise<void>;
  addMember: (name: string, role?: 'admin' | 'member' | 'child') => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const HouseholdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshHousehold = async () => {
    try {
      setIsLoading(true);
      const data = await HouseholdService.loadHouseholdData();
      setHousehold(data.household);
      setMembers(data.members);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load household data');
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (name: string, role: 'admin' | 'member' | 'child' = 'member') => {
    if (!household) return;
    try {
      await HouseholdService.addNewMember(household.id, name, role);
      await refreshHousehold();
    } catch (err: any) {
      setError(err?.message || 'Failed to add member');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await HouseholdService.removeMember(memberId);
      await refreshHousehold();
    } catch (err: any) {
      setError(err?.message || 'Failed to remove member');
    }
  };

  useEffect(() => {
    refreshHousehold();
  }, []);

  return (
    <HouseholdContext.Provider
      value={{
        household,
        members,
        isLoading,
        error,
        refreshHousehold,
        addMember,
        removeMember,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = (): HouseholdContextType => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};
