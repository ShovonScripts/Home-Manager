export interface Household {
  id: string;
  name: string;
  currency: string;
  createdAt: number;
  updatedAt: number;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  name: string;
  role: 'admin' | 'member' | 'child';
  avatarUrl?: string;
  createdAt: number;
}

export interface GroceryList {
  id: string;
  householdId: string;
  name: string;
  isArchived: boolean;
  createdAt: number;
}

export interface GroceryItem {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  category: string;
  isCompleted: boolean;
  assignedTo?: string;
  createdAt: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  householdId: string;
  categoryId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string; // member id
  date: number;
  notes?: string;
  createdAt: number;
}

export interface Bill {
  id: string;
  householdId: string;
  title: string;
  amount: number;
  currency: string;
  dueDate: number;
  isPaid: boolean;
  category: string;
  recurrence: 'none' | 'monthly' | 'yearly';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  categoryId: string;
  assignedTo?: string; // member id
  dueDate?: number;
  isCompleted: boolean;
  createdAt: number;
}

export interface Reminder {
  id: string;
  householdId: string;
  title: string;
  dateTime: number;
  isCompleted: boolean;
  type: 'medicine' | 'general';
  targetMemberId?: string;
  createdAt: number;
}

export interface ImportantDate {
  id: string;
  householdId: string;
  title: string;
  date: number;
  isRecurringYearly: boolean;
  category: 'birthday' | 'anniversary' | 'event';
  createdAt: number;
}

export interface Note {
  id: string;
  householdId: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}
