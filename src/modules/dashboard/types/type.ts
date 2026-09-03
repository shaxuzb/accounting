export type ApiDate = string;
export type SourceStatus = "AVAILABLE" | "PARTIAL" | "NOT_AVAILABLE" | string;

export interface DashboardFilters {
  dateFrom: string | null;
  dateTo: string | null;
  currencyIds: number[];
}

export interface CashItem {
  accountId: number;
  sourceType: string;
  accountName: string;
  currencyId: number;
  currencyCode: string;
  openingBalance: number;
  inflow: number;
  outflow: number;
  closingBalance: number;
}

export interface CashTotals {
  openingBalance: number;
  inflow: number;
  outflow: number;
  closingBalance: number;
}

export interface CashSummary {
  sourceStatus: SourceStatus;
  items: CashItem[];
  totals: CashTotals;
}

export interface StatusCount {
  status: string;
  count: number;
  amount: number | null;
  currencyId: number | null;
}

export interface RelationshipSide {
  sourceStatus: SourceStatus;
  total: number;
  statusCounts: StatusCount[];
}

export interface RelationshipsSummary {
  sourceStatus: SourceStatus;
  incoming: RelationshipSide;
  outgoing: RelationshipSide;
}

export interface TaskSummary {
  sourceStatus: SourceStatus;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  items: Array<{
    id: number;
    title: string;
    date: ApiDate | null;
    status: string;
    isOverdue: boolean;
  }>;
}

export interface DebtSummary {
  sourceStatus: SourceStatus;
  current: number;
  overdue: number | null;
  buckets: Array<{ bucket: string; count: number; amount: number }>;
  counterparties: Array<{
    counterpartyId: number;
    counterpartyName: string;
    currentAmount: number;
    overdueAmount: number | null;
    currencyId: number;
  }>;
}

export interface ReceivablesPayablesSummary {
  sourceStatus: SourceStatus;
  receivables: DebtSummary;
  payables: DebtSummary;
}

export interface TaxSummary {
  sourceStatus: SourceStatus;
  total: number;
  isVatPayer: boolean | null;
  items: Array<{
    documentType: string;
    currencyId: number;
    count: number;
    vatAmount: number;
  }>;
}

export interface ElectronicDocumentsSummary {
  sourceStatus: SourceStatus;
  statusCounts: StatusCount[];
  typeCounts: StatusCount[];
  directionCounts: StatusCount[];
  currencyTotals: Array<{
    currencyId: number;
    count: number;
    amount: number | null;
  }>;
  amountSeries: Array<{
    date: ApiDate;
    amount: number;
    currencyId: number | null;
  }>;
}

export interface DashboardOverview {
  filters: DashboardFilters;
  cash: CashSummary;
  relationships: RelationshipsSummary;
  tasks: TaskSummary;
  receivables: DebtSummary;
  payables: DebtSummary;
  tax: TaxSummary;
  electronicDocuments: ElectronicDocumentsSummary;
}

export interface ElectronicDocumentsFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
  documentTypes?: string[];
  statusIds?: number[];
}

export interface TaxSummaryFilters {
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyIds?: number[];
  documentTypes?: string[];
}
