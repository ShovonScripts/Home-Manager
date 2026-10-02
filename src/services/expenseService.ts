import { ExpenseRepository } from '../storage/repositories/expenseRepository';
import { Expense, ExpenseCategory } from '../types';
import { normalizeCurrencySymbol } from '../utils/currency';

export const ExpenseService = {
  async loadExpensesData(householdId: string): Promise<{ expenses: Expense[]; categories: ExpenseCategory[] }> {
    const expenses = await ExpenseRepository.getExpenses(householdId);
    const categories = await ExpenseRepository.getCategories();
    return { expenses, categories };
  },

  async addExpense(
    householdId: string,
    categoryId: string,
    title: string,
    amount: number,
    paidBy: string,
    date: number,
    notes?: string,
    currency: string = '৳'
  ): Promise<Expense> {
    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      householdId,
      categoryId,
      title: title.trim(),
      amount: Number(amount),
      currency: normalizeCurrencySymbol(currency),
      paidBy,
      date,
      notes: notes?.trim() || undefined,
      createdAt: Date.now(),
    };
    await ExpenseRepository.addExpense(newExpense);
    return newExpense;
  },

  async updateExpense(expense: Expense): Promise<void> {
    await ExpenseRepository.updateExpense(expense);
  },

  async deleteExpense(expenseId: string): Promise<void> {
    await ExpenseRepository.deleteExpense(expenseId);
  },
};
