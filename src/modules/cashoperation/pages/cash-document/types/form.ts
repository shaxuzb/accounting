export interface CashDocumentForm {
  cashBoxId: number | null;
  paymentTypeId: number | null;
  counterpartyId: number | null;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number | null;
  comment: string;
  cashChartAccountId: number | null;
  offsetAccountId: number | null;
}
