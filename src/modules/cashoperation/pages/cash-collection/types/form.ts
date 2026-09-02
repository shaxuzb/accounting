export interface CashCollectionForm {
  cashBoxId: number | null;
  bankAccountId: number | null;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number;
  cashChartAccountId: number | null;
  cashInTransitAccountId: number | null;
  bankChartAccountId: number | null;
  comment: string;
}

export interface CashCollectionRequest extends CashCollectionForm {
  documentRegistryId?: never;
  statusId?: never;
}
