export interface CashDocumentForm {
  cashBoxId: number | null;
  paymentTypeId: number | null;
  counterpartyId: number | null;
  contractId: number | null;
  /** RKO only: the cash box the money is handed to (a transfer, no counterparty). */
  destinationCashBoxId: number | null;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number | null;
  comment: string;
  cashChartAccountId: number | null;
  offsetAccountId: number | null;
}
