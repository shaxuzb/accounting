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
  counterpartyId?: number | null;
  counterpartyName?: string | null;
  comment?: string | null;
  currencyId?: number | null;
  currencyName?: string | null;
  receipt: number;
  payment: number;
  runningBalance: number;
  documentTypeId?: number;
  documentId?: number;
  /** 1C «Номер корреспондирующего счета». */
  correspondentAccount?: string | null;
  /** A cash order's «Принято от» / «Выдать». */
  personName?: string | null;
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

/** One day of the cash book (1C «Вкладной лист кассовой книги» and «Отчет кассира»). */
export interface CashBookSheet {
  date: string;
  sheetNumber: number;
  openingBalance: number;
  totalReceipt: number;
  totalPayment: number;
  closingBalance: number;
  receiptCount: number;
  paymentCount: number;
  items: CashBookEntry[];
}

export interface CashBookSheets {
  cashBoxId: number;
  cashBoxName: string;
  currencyCode?: string | null;
  organizationName: string;
  cashier?: string | null;
  chiefAccountant?: string | null;
  cashLimit?: number | null;
  sheets: CashBookSheet[];
}
