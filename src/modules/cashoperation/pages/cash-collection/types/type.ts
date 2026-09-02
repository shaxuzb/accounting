export interface CashCollectionDocument {
  id: number;
  documentRegistryId?: number | null;
  docNumber?: string | null;
  docDate: string;
  cashBoxId: number;
  cashBoxName?: string | null;
  bankAccountId: number;
  bankAccountNumber?: string | null;
  currencyId: number;
  currencyCode?: string | null;
  currencyName?: string | null;
  amount: number;
  exchangeRate: number;
  cashChartAccountId?: number | null;
  cashInTransitAccountId?: number | null;
  bankChartAccountId?: number | null;
  bankOperationId?: number | null;
  statusId: number;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  comment?: string | null;
}

export type CashCollectionInTransit = Pick<
  CashCollectionDocument,
  | "id"
  | "documentRegistryId"
  | "docNumber"
  | "docDate"
  | "cashBoxId"
  | "cashBoxName"
  | "bankAccountId"
  | "bankAccountNumber"
  | "currencyId"
  | "currencyCode"
  | "amount"
>;
