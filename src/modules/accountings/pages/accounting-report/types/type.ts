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
  accountCode: string;
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
  accountCode: string;
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
  counterpartAccountCode: string;
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

export interface AccountTurnoverEntry {
  id: number;
  postingDate: string;
  journalNumber: string;
  documentNumber: string;
  documentTypeId: number | null;
  documentType: string;
  description: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  amount: number;
  currencyId: number | null;
  currency: string;
  organizationId: number | null;
  organization: string;
  counterparty: string;
  warehouse: string;
}

export interface AccountTurnoverResponse {
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
  entries: AccountTurnoverEntry[];
}

export interface AccountingReportQueryBase {
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
}

export interface AccountTurnoverQuery extends AccountingReportQueryBase {
  documentTypeId?: number | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface BalanceSheetQuery extends AccountingReportQueryBase {}
export interface IncomeStatementQuery extends AccountingReportQueryBase {}
export interface CashFlowQuery extends AccountingReportQueryBase {}
export interface JournalQuery extends AccountTurnoverQuery {}
export interface AccountCardQuery extends AccountingReportQueryBase {
  accountId?: number | null;
}

export interface RawAccountingReportResponse {
  [key: string]: unknown;
}
