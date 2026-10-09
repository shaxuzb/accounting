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
  debitAccountNumber: string;
  creditAccountNumber: string;
  amount: number;
  currency: string;
  /** The entry's quantity (debit or credit side), empty for a money-only entry. */
  quantity: string;
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
