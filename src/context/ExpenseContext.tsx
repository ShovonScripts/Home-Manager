import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { ExpenseService } from '../services/expenseService';
import { useHousehold } from './HouseholdContext';

interface ExpenseState {
  expenses: Expense[];
  categories: ExpenseCategory[];
  selectedCategory: string | null;
  searchQuery: string;
  selectedMonth: string; // 'all' or 'YYYY-MM'
  isLoading: boolean;
  error: string | null;
}

type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA'; payload: { expenses: Expense[]; categories: ExpenseCategory[] } }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_MONTH'; payload: string };

const getLocalMonthKey = (timestamp: number): string => {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const initialState: ExpenseState = {
  expenses: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  selectedMonth: 'all',
  isLoading: true,
  error: null,
};

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_DATA':
      return { ...state, expenses: action.payload.expenses, categories: action.payload.categories, isLoading: false };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload };
    default:
      return state;
  }
}

interface ExpenseContextType extends ExpenseState {
  loadExpenses: () => Promise<void>;
  addExpense: (
    categoryId: string,
    title: string,
    amount: number,
    paidBy: string,
    date: number,
    notes?: string,
    currency?: string
  ) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  setCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setMonthFilter: (month: string) => void;
  filteredExpenses: Expense[];
  totalAmount: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { household } = useHousehold();

  const loadExpenses = useCallback(async () => {
    if (!household) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await ExpenseService.loadExpensesData(household.id);
      dispatch({ type: 'SET_DATA', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to load expenses' });
    }
  }, [household]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = async (
    categoryId: string,
    title: string,
    amount: number,
    paidBy: string,
    date: number,
    notes?: string,
    currency: string = '৳'
  ) => {
    if (!household) return;
    try {
      const newExp = await ExpenseService.addExpense(
        household.id,
        categoryId,
        title,
        amount,
        paidBy,
        date,
        notes,
        currency
      );
      dispatch({ type: 'ADD_EXPENSE', payload: newExp });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to add expense' });
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      await ExpenseService.updateExpense(expense);
      dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to update expense' });
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await ExpenseService.deleteExpense(expenseId);
      dispatch({ type: 'DELETE_EXPENSE', payload: expenseId });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message || 'Failed to delete expense' });
    }
  };

  const setCategory = (categoryId: string | null) => {
    dispatch({ type: 'SET_CATEGORY', payload: categoryId });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const setMonthFilter = (month: string) => {
    dispatch({ type: 'SET_MONTH', payload: month });
  };

  // Filtered expenses
  const filteredExpenses = state.expenses.filter((exp) => {
    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchNotes = exp.notes?.toLowerCase().includes(q) || false;
      const matchPaidBy = exp.paidBy.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchPaidBy) return false;
    }

    // Category filter
    if (state.selectedCategory && exp.categoryId !== state.selectedCategory) {
      return false;
    }

    // Month filter ('all' or 'YYYY-MM' in local time)
    if (state.selectedMonth !== 'all') {
      const expMonth = getLocalMonthKey(exp.date);
      if (expMonth !== state.selectedMonth) return false;
    }

    return true;
  });

  const totalAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ExpenseContext.Provider
      value={{
        ...state,
        loadExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        setCategory,
        setSearchQuery,
        setMonthFilter,
        filteredExpenses,
        totalAmount,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
