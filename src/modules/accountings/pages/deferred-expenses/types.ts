import type { ManualEntrySubkonto } from "../manual-entries/types";

export const deferredExpenseMethods = { byMonths: 1, byDays: 2 } as const;

/** A deferred expense (1C «Расходы будущих периодов»): the 31xx analytics with its write-off schedule. */
export interface DeferredExpense {
  itemId: number;
  name: string;
  /** The 31xx debit balance kept by the item today. */
  balance: number;
  hasSchedule: boolean;
  recognitionMethod?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  expenseAccountId?: number | null;
  expenseAccountNumber?: string | null;
  expenseAccountName?: string | null;
  expenseSubkontos: ManualEntrySubkonto[];
}

export interface DeferredExpenseSave {
  name: string;
  recognitionMethod: number;
  startDate: string;
  endDate: string;
  expenseAccountId: number;
  expenseSubkontos: ManualEntrySubkonto[];
}
