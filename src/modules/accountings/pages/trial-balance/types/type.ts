export interface TrialBalanceQuery {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
  includeZeroBalance?: boolean;
}

export interface TrialBalanceItem {
  accountId: number;
  accountCode: string | null;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface TrialBalanceResult {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
  includeZeroBalance?: boolean;
  openingDebitTotal: number;
  openingCreditTotal: number;
  periodDebitTotal: number;
  periodCreditTotal: number;
  closingDebitTotal: number;
  closingCreditTotal: number;
  items: TrialBalanceItem[];
}
