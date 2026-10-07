export interface AccountingPeriod {
  id: number | null;
  year: number;
  month: number;
  hasPeriod: boolean;
  isClosed: boolean;
  closedAt?: string | null;
  /** Opened again with an earlier month: has to be closed again, in order. */
  recloseRequired?: boolean;
  /** Profit (negative: loss) the closing moved to 9910. */
  result?: number | null;
}

export interface MonthCloseLine {
  accountNumber: string;
  accountName: string;
  analytics?: string | null;
  /** Positive: income, negative: expense. */
  amount: number;
}

export interface MonthCloseCheck {
  periodId: number;
  year: number;
  month: number;
  isClosed: boolean;
  isYearEnd: boolean;
  monthIsOver: boolean;
  previousPeriodsOpen: boolean;
  draftDocumentCount: number;
  /** Assets in use not yet depreciated for the month: the month closes only after the run. */
  assetsAwaitingDepreciation?: number;
  entriesMissingAnalytics?: number;
  rentAwaitingAccrual?: number;
  revaluationLineCount: number;
  revaluationDifference: number;
  revaluationError?: string | null;
  missingAccounts: string[];
  /** 0000 at the month end: the month closes only once the opening balances agree. */
  openingOffsetBalance: number;
  /** Input VAT (4410) and output VAT (6410) at the month end, and what is offset. */
  vatInput: number;
  vatOutput: number;
  vatOffset: number;
  /** Profit tax (VAT payers): the year's profit before tax, rate, year's tax, charged before, this month's charge. */
  profitTaxBase?: number | null;
  profitTaxRate?: number | null;
  profitTaxYear?: number | null;
  profitTaxCharged?: number | null;
  profitTax?: number | null;
  /** Deferred expenses written off for the month (Dt expense — Kt 31xx). */
  deferredLines?: MonthCloseDeferredLine[];
  /** 31xx balances with no write-off schedule (a warning). */
  deferredWithoutSchedule?: number;
  /** 20/23/25/26 balances carried to 9130 (amount: debit balance). */
  costLines: MonthCloseLine[];
  lines: MonthCloseLine[];
  result: number;
  yearResult?: number | null;
  canClose: boolean;
}

export interface MonthCloseDeferredLine {
  name: string;
  deferredAccountNumber: string;
  expenseAccountNumber: string;
  expenseAccountName: string;
  expenseAnalytics?: string | null;
  /** The 31xx balance at the month end, before the write-off. */
  balance: number;
  amount: number;
}

export interface AccountingPeriodMonth {
  id: number;
  year: number;
  month: number;
}

export interface MonthCloseThroughResult {
  closed: AccountingPeriodMonth[];
  stopped?: AccountingPeriodMonth | null;
  /** MONTH_NOT_OVER, REVALUATION_REQUIRED, DEPRECIATION_REQUIRED, ACCOUNTS_MISSING, OPENING_OFFSET, PREVIOUS_OPEN, ERROR. */
  stopReasons: string[];
  stopMessage?: string | null;
  recloseRemaining: AccountingPeriodMonth[];
}
