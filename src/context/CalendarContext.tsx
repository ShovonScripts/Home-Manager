import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ImportantDate } from '../types';
import { CalendarService } from '../services/calendarService';
import { useHousehold } from './HouseholdContext';

interface CalendarState {
  importantDates: ImportantDate[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

type CalendarAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATES'; payload: ImportantDate[] }
  | { type: 'ADD_DATE'; payload: ImportantDate }
  | { type: 'UPDATE_DATE'; payload: ImportantDate }
  | { type: 'DELETE_DATE'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string };

const initialState: CalendarState = {
  importantDates: [],
  selectedCategory: null,
  searchQuery: '',
  isLoading: true,
  error: null,
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DATES':
      return { ...state, importantDates: action.payload, isLoading: false };
    case 'ADD_DATE':
      return { ...state, importantDates: [action.payload, ...state.importantDates] };
    case 'UPDATE_DATE':
      return {
        ...state,
        importantDates: state.importantDates.map((d) => (d.id === action.payload.id ? action.payload : d)),
      };
    case 'DELETE_DATE':
      return { ...state, importantDates: state.importantDates.filter((d) => d.id !== action.payload) };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

interface CalendarContextType extends CalendarState {
  loadImportantDates: () => Promise<void>;
  addImportantDate: (
    title: string,
    date: number,
    category: 'birthday' | 'anniversary' | 'event',
    isRecurringYearly?: boolean
  ) => Promise<void>;
  updateImportantDate: (item: ImportantDate) => Promise<void>;
  deleteImportantDate: (itemId: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  filteredDates: ImportantDate[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const { household } = useHousehold();

  const loadImportantDates = useCallback(async () => {
    if (!household) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const dates = await CalendarService.loadImportantDates(household.id);
      dispatch({ type: 'SET_DATES', payload: dates });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load important dates' });
    }
  }, [household]);

  useEffect(() => {
    loadImportantDates();
  }, [loadImportantDates]);

  const addImportantDate = async (
    title: string,
    date: number,
    category: 'birthday' | 'anniversary' | 'event',
    isRecurringYearly: boolean = true
  ) => {
    if (!household) return;
    try {
      const newItem = await CalendarService.addImportantDate(
        household.id,
        title,
        date,
        category,
        isRecurringYearly
      );
      dispatch({ type: 'ADD_DATE', payload: newItem });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add important date' });
    }
  };

  const updateImportantDate = async (item: ImportantDate) => {
    try {
      await CalendarService.updateImportantDate(item);
      dispatch({ type: 'UPDATE_DATE', payload: item });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update important date' });
    }
  };

  const deleteImportantDate = async (itemId: string) => {
    try {
      await CalendarService.deleteImportantDate(itemId);
      dispatch({ type: 'DELETE_DATE', payload: itemId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete important date' });
    }
  };

  const setSelectedCategory = (category: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  // Filtered dates
  const filteredDates = state.importantDates.filter((item) => {
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }

    if (state.selectedCategory && item.category !== state.selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <CalendarContext.Provider
      value={{
        ...state,
        loadImportantDates,
        addImportantDate,
        updateImportantDate,
        deleteImportantDate,
        setSelectedCategory,
        setSearchQuery,
        filteredDates,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
