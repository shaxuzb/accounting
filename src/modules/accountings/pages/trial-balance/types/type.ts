export interface TrialBalanceQuery {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
  includeZeroBalance?: boolean;
}

export type TrialBalanceResult = unknown;
