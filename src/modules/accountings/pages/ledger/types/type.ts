export interface LedgerQuery {
  accountId: number | null;
  periodId?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  currencyId?: number | null;
  counterpartyId?: number | null;
  warehouseId?: number | null;
  page?: number | null;
  pageSize?: number | null;
}

export type LedgerResult = unknown;
