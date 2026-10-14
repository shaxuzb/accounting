export interface TrialBalanceQuery {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
  includeZeroBalance?: boolean;
}

export interface TrialBalanceItem {
  accountId: number;
  accountNumber: string | null;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  /** A group account's line (5010): its subaccounts' sums, not in the totals again. */
  isGroup?: boolean;
  parentAccountId?: number | null;
  /** An off-balance account (001–009): listed after the totals, not in them (1C). */
  isOffBalance?: boolean;
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
