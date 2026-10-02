import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const loadHousehold = useCallback(() => {
    return HouseholdService.loadHouseholdData()
      .then((data) => {
        if (!data.household) throw new Error('No household data found. Please retry.');
        setHousehold(data.household);
        setMembers(data.members);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load household data');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const refreshHousehold = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await loadHousehold();
  }, [loadHousehold]);

  const addMember = async (name: string, role: 'admin' | 'member' | 'child' = 'member') => {
    if (!household) {
      const error = new Error('Household data is not available. Please retry loading it.');
      setError(error.message);
      throw error;
    }
    try {
      await HouseholdService.addNewMember(household.id, name, role);
      await refreshHousehold();
    } catch (err: any) {
      setError(err?.message || 'Failed to add member');
      throw err; // The form must not announce success or clear its draft on a failed write.
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
    void loadHousehold();
  }, [loadHousehold]);

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
