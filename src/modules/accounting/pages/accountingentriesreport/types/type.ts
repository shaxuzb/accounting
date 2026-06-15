export interface AccountingEntriesReportSubkontoItem {
  label: string;
  value: string;
  side?: "debit" | "credit";
}

export interface AccountingEntriesReportPosting {
  id: string | number;
  date: string;
  debitAccountCode: string;
  debitAccountName: string;
  creditAccountCode: string;
  creditAccountName: string;
  amount: number;
  currency: string;
  documentNumber: string;
  subkonto: AccountingEntriesReportSubkontoItem[];
  debitDetails: AccountingEntriesReportSubkontoItem[];
  creditDetails: AccountingEntriesReportSubkontoItem[];
}

export interface AccountingEntriesReport {
  date: string;
  totalCount: number;
  totalAmount: number;
  currency: string;
  documentNumber: string;
  postings: AccountingEntriesReportPosting[];
}

export interface AccountingEntriesReportQueryParams {
  documentId: string | number;
  documentTypeId?: string | number;
}
