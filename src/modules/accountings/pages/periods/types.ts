export interface AccountingPeriod {
  id: number | null;
  year: number;
  month: number;
  hasPeriod: boolean;
  isClosed: boolean;
  closedAt?: string | null;
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
  /** 20/23/25/26 balances carried to 9130 (amount: debit balance). */
  costLines: MonthCloseLine[];
  lines: MonthCloseLine[];
  result: number;
  yearResult?: number | null;
  canClose: boolean;
}
