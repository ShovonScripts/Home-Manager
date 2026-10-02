import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Reminder } from '../types';
import { ReminderService } from '../services/reminderService';
import { useHousehold } from './HouseholdContext';

export type ReminderFilter = 'all' | 'pending' | 'completed' | 'medicine' | 'general';

interface ReminderState {
  reminders: Reminder[];
  filter: ReminderFilter;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

type ReminderAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'TOGGLE_REMINDER'; payload: { id: string; isCompleted: boolean } }
  | { type: 'SET_FILTER'; payload: ReminderFilter }
  | { type: 'SET_SEARCH'; payload: string };

const initialState: ReminderState = {
  reminders: [],
  filter: 'all',
  searchQuery: '',
  isLoading: true,
  error: null,
};

function reminderReducer(state: ReminderState, action: ReminderAction): ReminderState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.payload, isLoading: false };
    case 'ADD_REMINDER':
      return { ...state, reminders: [action.payload, ...state.reminders] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.payload) };
    case 'TOGGLE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? { ...r, isCompleted: action.payload.isCompleted } : r
        ),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

interface ReminderContextType extends ReminderState {
  loadReminders: () => Promise<void>;
  addReminder: (
    title: string,
    dateTime: number,
    type: 'medicine' | 'general',
    targetMemberId?: string
  ) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  toggleReminder: (reminderId: string, currentStatus: boolean) => Promise<void>;
  setFilter: (filter: ReminderFilter) => void;
  setSearchQuery: (query: string) => void;
  filteredReminders: Reminder[];
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reminderReducer, initialState);
  const { household } = useHousehold();

  const loadReminders = useCallback(async () => {
    if (!household) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const reminders = await ReminderService.loadReminders(household.id);
      dispatch({ type: 'SET_REMINDERS', payload: reminders });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load reminders' });
    }
  }, [household]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const addReminder = async (
    title: string,
    dateTime: number,
    type: 'medicine' | 'general',
    targetMemberId?: string
  ) => {
    if (!household) return;
    try {
      const newRem = await ReminderService.addReminder(
        household.id,
        title,
        dateTime,
        type,
        targetMemberId
      );
      dispatch({ type: 'ADD_REMINDER', payload: newRem });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add reminder' });
    }
  };

  const updateReminder = async (reminder: Reminder) => {
    try {
      await ReminderService.updateReminder(reminder);
      dispatch({ type: 'UPDATE_REMINDER', payload: reminder });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update reminder' });
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      await ReminderService.deleteReminder(reminderId);
      dispatch({ type: 'DELETE_REMINDER', payload: reminderId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete reminder' });
    }
  };

  const toggleReminder = async (reminderId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    dispatch({ type: 'TOGGLE_REMINDER', payload: { id: reminderId, isCompleted: newStatus } });
    try {
      await ReminderService.toggleReminder(reminderId, currentStatus);
    } catch (err: any) {
      dispatch({ type: 'TOGGLE_REMINDER', payload: { id: reminderId, isCompleted: currentStatus } });
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to toggle reminder' });
    }
  };

  const setFilter = (filter: ReminderFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  // Filtered reminders
  const filteredReminders = state.reminders.filter((rem) => {
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = rem.title.toLowerCase().includes(q);
      const matchType = rem.type.toLowerCase().includes(q);
      if (!matchTitle && !matchType) return false;
    }

    if (state.filter === 'pending' && rem.isCompleted) return false;
    if (state.filter === 'completed' && !rem.isCompleted) return false;
    if (state.filter === 'medicine' && rem.type !== 'medicine') return false;
    if (state.filter === 'general' && rem.type !== 'general') return false;

    return true;
  });

  return (
    <ReminderContext.Provider
      value={{
        ...state,
        loadReminders,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminder,
        setFilter,
        setSearchQuery,
        filteredReminders,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = (): ReminderContextType => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminder must be used within a ReminderProvider');
  }
  return context;
};
