import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { GroceryList, GroceryItem } from '../types';
import { GroceryService } from '../services/groceryService';
import { useHousehold } from './HouseholdContext';

export type GroceryFilter = 'all' | 'pending' | 'completed';

interface GroceryState {
  list: GroceryList | null;
  items: GroceryItem[];
  filter: GroceryFilter;
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

type GroceryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { list: GroceryList; items: GroceryItem[] } }
  | { type: 'ADD_ITEM'; payload: GroceryItem }
  | { type: 'UPDATE_ITEM'; payload: GroceryItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'TOGGLE_ITEM'; payload: { id: string; isCompleted: boolean } }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_FILTER'; payload: GroceryFilter }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string };

const initialState: GroceryState = {
  list: null,
  items: [],
  filter: 'all',
  selectedCategory: null,
  searchQuery: '',
  isLoading: true,
  error: null,
};

function groceryReducer(state: GroceryState, action: GroceryAction): GroceryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: action.payload ? null : state.error };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DATA':
      return { ...state, list: action.payload.list, items: action.payload.items, isLoading: false, error: null };
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.payload.id ? action.payload : i)),
      };
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case 'TOGGLE_ITEM':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, isCompleted: action.payload.isCompleted } : i
        ),
      };
    case 'CLEAR_COMPLETED':
      return { ...state, items: state.items.filter((i) => !i.isCompleted) };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

interface GroceryContextType extends GroceryState {
  loadItems: () => Promise<void>;
  addItem: (name: string, quantity: string, category: string, assignedTo?: string) => Promise<void>;
  updateItem: (item: GroceryItem) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  toggleItem: (itemId: string, currentStatus: boolean) => Promise<void>;
  clearCompleted: () => Promise<void>;
  setFilter: (filter: GroceryFilter) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  filteredItems: GroceryItem[];
}

const GroceryContext = createContext<GroceryContextType | undefined>(undefined);

export const GroceryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(groceryReducer, initialState);
  const { household, isLoading: householdIsLoading, error: householdError, refreshHousehold } = useHousehold();
  const householdId = household?.id;

  const loadItems = useCallback(async () => {
    if (!householdId) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await GroceryService.getActiveListAndItems(householdId);
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load grocery items' });
    }
  }, [householdId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const retryLoadItems = async () => {
    // A missing/failed household must be retried too, rather than spinning forever.
    if (householdError || !householdId) await refreshHousehold();
    if (householdId) await loadItems();
  };

  const addItem = async (
    name: string,
    quantity: string,
    category: string,
    assignedTo?: string
  ) => {
    if (!state.list) return;
    try {
      const newItem = await GroceryService.addGroceryItem(
        state.list.id,
        name,
        quantity,
        category,
        assignedTo
      );
      dispatch({ type: 'ADD_ITEM', payload: newItem });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add item' });
    }
  };

  const updateItem = async (item: GroceryItem) => {
    try {
      await GroceryService.updateGroceryItem(item);
      dispatch({ type: 'UPDATE_ITEM', payload: item });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update item' });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await GroceryService.deleteGroceryItem(itemId);
      dispatch({ type: 'DELETE_ITEM', payload: itemId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete item' });
    }
  };

  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic UI update
    dispatch({ type: 'TOGGLE_ITEM', payload: { id: itemId, isCompleted: newStatus } });
    try {
      await GroceryService.toggleGroceryItem(itemId, currentStatus);
    } catch (err: any) {
      // Revert on error
      dispatch({ type: 'TOGGLE_ITEM', payload: { id: itemId, isCompleted: currentStatus } });
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to toggle item' });
    }
  };

  const clearCompleted = async () => {
    if (!state.list) return;
    try {
      await GroceryService.clearCompletedItems(state.list.id);
      dispatch({ type: 'CLEAR_COMPLETED' });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to clear completed items' });
    }
  };

  const setFilter = (filter: GroceryFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setCategory = (category: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  // Filtered items logic
  const filteredItems = state.items.filter((item) => {
    // Search query filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchCategory = item.category.toLowerCase().includes(query);
      if (!matchName && !matchCategory) return false;
    }

    // Status filter
    if (state.filter === 'pending' && item.isCompleted) return false;
    if (state.filter === 'completed' && !item.isCompleted) return false;

    // Category filter
    if (state.selectedCategory && item.category !== state.selectedCategory) return false;

    return true;
  });

  return (
    <GroceryContext.Provider
      value={{
        ...state,
        isLoading: householdIsLoading || (Boolean(householdId) && state.isLoading),
        error: householdError ?? state.error,
        loadItems: retryLoadItems,
        addItem,
        updateItem,
        deleteItem,
        toggleItem,
        clearCompleted,
        setFilter,
        setCategory,
        setSearchQuery,
        filteredItems,
      }}
    >
      {children}
    </GroceryContext.Provider>
  );
};

export const useGrocery = (): GroceryContextType => {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error('useGrocery must be used within a GroceryProvider');
  }
  return context;
};
