export interface LedgerQuery {
  accountId: number | null;
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
  counterpartyId?: number | null;
  warehouseId?: number | null;
  /** The settlement document (a cmn_document_registry id), as 1C «Карточка счета» by «Документ расчетов». */
  settlementDocumentId?: number | null;
  /** Its name, for the filter tag only. */
  settlementDocumentName?: string | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface LedgerTransaction {
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
  /** The settlement document of the account's own side and its name. */
  settlementDocumentId: number | null;
  settlementDocument: string | null;
}

export interface LedgerResult {
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
  transactions: LedgerTransaction[];
}
