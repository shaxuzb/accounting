export interface CashBookCashBox {
  id: number;
  organizationId?: number;
  organizationName?: string;
  branchId?: number;
  branchName?: string;
  code?: string;
  name: string;
  currencyId?: number;
  currencyName?: string;
  stateId?: number;
  stateName?: string;
  createdDate?: string;
}

export interface CashBookEntry {
  moneyRegisterEntryId: number;
  cashOperationId: number;
  docDate: string;
  docNumber?: string | null;
  documentKind?: string | null;
  paymentPurposeId?: number | null;
  paymentPurposeName?: string | null;
  counterpartyId?: number | null;
  counterpartyName?: string | null;
  comment?: string | null;
  currencyId?: number | null;
  currencyName?: string | null;
  receipt: number;
  payment: number;
  runningBalance: number;
}

export interface CashBookReport {
  cashBoxId: number;
  cashBoxName?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  openingBalance: number;
  closingBalance: number;
  totalReceipt: number;
  totalPayment: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: CashBookEntry[];
}
