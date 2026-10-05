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
  revaluationLineCount: number;
  revaluationDifference: number;
  revaluationError?: string | null;
  missingAccounts: string[];
  lines: MonthCloseLine[];
  result: number;
  yearResult?: number | null;
  canClose: boolean;
}
