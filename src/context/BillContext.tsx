import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Bill } from '../types';
import { BillService } from '../services/billService';
import { useHousehold } from './HouseholdContext';

export type BillStatusFilter = 'all' | 'unpaid' | 'paid' | 'overdue';

interface BillState {
  bills: Bill[];
  selectedCategory: string | null;
  selectedStatus: BillStatusFilter;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

type BillAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BILLS'; payload: Bill[] }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL'; payload: Bill }
  | { type: 'DELETE_BILL'; payload: string }
  | { type: 'TOGGLE_PAID'; payload: { id: string; isPaid: boolean } }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_STATUS'; payload: BillStatusFilter }
  | { type: 'SET_SEARCH'; payload: string };

const initialState: BillState = {
  bills: [],
  selectedCategory: null,
  selectedStatus: 'all',
  searchQuery: '',
  isLoading: true,
  error: null,
};

function billReducer(state: BillState, action: BillAction): BillState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_BILLS':
      return { ...state, bills: action.payload, isLoading: false };
    case 'ADD_BILL':
      return { ...state, bills: [action.payload, ...state.bills] };
    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map((b) => (b.id === action.payload.id ? action.payload : b)),
      };
    case 'DELETE_BILL':
      return { ...state, bills: state.bills.filter((b) => b.id !== action.payload) };
    case 'TOGGLE_PAID':
      return {
        ...state,
        bills: state.bills.map((b) =>
          b.id === action.payload.id ? { ...b, isPaid: action.payload.isPaid } : b
        ),
      };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_STATUS':
      return { ...state, selectedStatus: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
}

interface BillContextType extends BillState {
  loadBills: () => Promise<void>;
  addBill: (
    title: string,
    amount: number,
    dueDate: number,
    category: string,
    notes?: string,
    recurrence?: 'none' | 'monthly' | 'yearly',
    currency?: string
  ) => Promise<void>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (billId: string) => Promise<void>;
  togglePaid: (billId: string, currentPaid: boolean) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  setSelectedStatus: (status: BillStatusFilter) => void;
  setSearchQuery: (query: string) => void;
  filteredBills: Bill[];
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
}

const BillContext = createContext<BillContextType | undefined>(undefined);

export const BillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(billReducer, initialState);
  const { household } = useHousehold();

  const loadBills = useCallback(async () => {
    if (!household) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const bills = await BillService.loadBills(household.id);
      dispatch({ type: 'SET_BILLS', payload: bills });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load bills' });
    }
  }, [household]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const addBill = async (
    title: string,
    amount: number,
    dueDate: number,
    category: string,
    notes?: string,
    recurrence: 'none' | 'monthly' | 'yearly' = 'monthly',
    currency: string = '৳'
  ) => {
    if (!household) return;
    try {
      const newBill = await BillService.addBill(
        household.id,
        title,
        amount,
        dueDate,
        category,
        notes,
        recurrence,
        currency
      );
      dispatch({ type: 'ADD_BILL', payload: newBill });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add bill' });
    }
  };

  const updateBill = async (bill: Bill) => {
    try {
      await BillService.updateBill(bill);
      dispatch({ type: 'UPDATE_BILL', payload: bill });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update bill' });
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      await BillService.deleteBill(billId);
      dispatch({ type: 'DELETE_BILL', payload: billId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete bill' });
    }
  };

  const togglePaid = async (billId: string, currentPaid: boolean) => {
    const newPaid = !currentPaid;
    dispatch({ type: 'TOGGLE_PAID', payload: { id: billId, isPaid: newPaid } });
    try {
      await BillService.toggleBillPaid(billId, currentPaid);
    } catch (err: any) {
      dispatch({ type: 'TOGGLE_PAID', payload: { id: billId, isPaid: currentPaid } });
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update payment status' });
    }
  };

  const setSelectedCategory = (category: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setSelectedStatus = (status: BillStatusFilter) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  // Date helper for overdue status
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTime = todayStart.getTime();

  // Filtered bills
  const filteredBills = state.bills.filter((bill) => {
    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = bill.title.toLowerCase().includes(q);
      const matchCategory = bill.category.toLowerCase().includes(q);
      const matchNotes = bill.notes?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchCategory && !matchNotes) return false;
    }

    // Category filter
    if (state.selectedCategory && bill.category !== state.selectedCategory) {
      return false;
    }

    // Status filter
    if (state.selectedStatus === 'unpaid' && bill.isPaid) return false;
    if (state.selectedStatus === 'paid' && !bill.isPaid) return false;
    if (state.selectedStatus === 'overdue') {
      const isOverdue = !bill.isPaid && bill.dueDate < todayTime;
      if (!isOverdue) return false;
    }

    return true;
  });

  // Summary calculations
  const totalOutstanding = state.bills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalPaid = state.bills
    .filter((b) => b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalOverdue = state.bills
    .filter((b) => !b.isPaid && b.dueDate < todayTime)
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <BillContext.Provider
      value={{
        ...state,
        loadBills,
        addBill,
        updateBill,
        deleteBill,
        togglePaid,
        setSelectedCategory,
        setSelectedStatus,
        setSearchQuery,
        filteredBills,
        totalOutstanding,
        totalPaid,
        totalOverdue,
      }}
    >
      {children}
    </BillContext.Provider>
  );
};

export const useBill = (): BillContextType => {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error('useBill must be used within a BillProvider');
  }
  return context;
};
