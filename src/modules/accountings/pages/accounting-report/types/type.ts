export interface ReportSection<T> {
  code: string;
  name: string;
  total?: number;
  inflow?: number;
  outflow?: number;
  net?: number;
  rows: T[];
}

export interface BalanceSheetRow {
  accountId: number | null;
  accountCode: string | null;
  accountNumber: string;
  accountName: string;
  balance: number;
}

export interface BalanceSheetResponse {
  periodId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  currencyId: number | null;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  sections: ReportSection<BalanceSheetRow>[];
}

export interface IncomeStatementRow {
  accountId: number | null;
  accountCode: string | null;
  accountNumber?: string;
  accountName: string;
  amount: number;
}

export interface IncomeStatementResponse {
  periodId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  currencyId: number | null;
  revenueTotal: number;
  costOfSalesTotal: number;
  operatingExpenseTotal: number;
  otherIncomeTotal: number;
  otherExpenseTotal: number;
  grossProfit: number;
  operatingProfit: number;
  netProfit: number;
  sections: ReportSection<IncomeStatementRow>[];
}

export interface CashFlowRow {
  counterpartAccountCode: string | null;
  counterpartAccountName: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface CashFlowResponse {
  periodId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  currencyId: number | null;
  openingCashBalance: number;
  closingCashBalance: number;
  sections: ReportSection<CashFlowRow>[];
}

export interface AccountTurnoverItem {
  accountId: number;
  accountCode: string | null;
  accountName: string;
  accountNumber: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface AccountTurnoverResponse {
  periodId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  currencyId: number | null;
  includeZeroBalance: boolean;
  openingDebitTotal: number;
  openingCreditTotal: number;
  periodDebitTotal: number;
  periodCreditTotal: number;
  closingDebitTotal: number;
  closingCreditTotal: number;
  items: AccountTurnoverItem[];
}

export interface AccountingReportQueryBase {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
}

export interface AccountTurnoverQuery {
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface JournalQuery extends AccountingReportQueryBase {
  documentTypeId?: number | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface JournalEntry {
  id: number;
  postingDate: string;
  journalNumber: string | null;
  documentNumber: string | null;
  documentTypeId: number | null;
  documentType: string | null;
  description: string | null;
  debitAccountCode: string | null;
  debitAccountName: string | null;
  creditAccountCode: string | null;
  creditAccountName: string | null;
  amount: number;
  currencyId: number | null;
  currency: string | null;
  organizationId: number | null;
  organization: string | null;
  counterparty: string | null;
  warehouse: string | null;
}

export interface JournalResponse {
  periodId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  currencyId: number | null;
  documentTypeId: number | null;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  entries: JournalEntry[];
}

export type BalanceSheetQuery = AccountingReportQueryBase;
export type IncomeStatementQuery = AccountingReportQueryBase;
export type CashFlowQuery = AccountingReportQueryBase;
export interface AccountCardQuery extends AccountingReportQueryBase {
  accountId?: number | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface AccountCardTransaction {
  id: number;
  postingDate: string;
  journalNumber: string | null;
  documentNumber: string | null;
  documentTypeId: number | null;
  documentType: string | null;
  reference: string | null;
  description: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
  currencyId: number | null;
  currency: string | null;
  organizationId: number | null;
  organization: string | null;
  counterpartyId: number | null;
  counterparty: string | null;
  warehouseId: number | null;
  warehouse: string | null;
}

export interface AccountCardResponse {
  accountId: number;
  accountCode: string | null;
  accountName: string;
  periodId: number | null;
  dateFrom: string | null;
  dateTo: string | null;
  currencyId: number | null;
  openingBalance: number;
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  transactions: AccountCardTransaction[];
}

export interface RawAccountingReportResponse {
  [key: string]: unknown;
}
