import type { HouseholdMember } from '../types';

// Resolve IDs first. Legacy names and references to removed members remain readable.
// Never guess a member ID from a name: multiple members may have the same name.
export const getMemberDisplayName = (
  storedValue: string | null | undefined,
  members: readonly HouseholdMember[]
): string => {
  if (!storedValue) return '';
  return members.find((member) => member.id === storedValue)?.name ?? storedValue;
};
