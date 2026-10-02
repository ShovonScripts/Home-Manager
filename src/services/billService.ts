import { BillRepository } from '../storage/repositories/billRepository';
import { Bill } from '../types';

export const BillService = {
  async loadBills(householdId: string): Promise<Bill[]> {
    return await BillRepository.getBills(householdId);
  },

  async addBill(
    householdId: string,
    title: string,
    amount: number,
    dueDate: number,
    category: string,
    notes?: string,
    recurrence: 'none' | 'monthly' | 'yearly' = 'monthly',
    currency: string = '৳'
  ): Promise<Bill> {
    const newBill: Bill = {
      id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      householdId,
      title: title.trim(),
      amount: Number(amount),
      currency,
      dueDate,
      isPaid: false,
      category,
      recurrence,
      notes: notes?.trim() || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await BillRepository.addBill(newBill);
    return newBill;
  },

  async updateBill(bill: Bill): Promise<void> {
    await BillRepository.updateBill(bill);
  },

  async deleteBill(billId: string): Promise<void> {
    await BillRepository.deleteBill(billId);
  },

  async toggleBillPaid(billId: string, currentStatus: boolean): Promise<void> {
    await BillRepository.setBillPaidStatus(billId, !currentStatus);
  },
};
