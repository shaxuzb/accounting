export interface CashDocumentForm {
  cashBoxId: number | null;
  paymentTypeId: number | null;
  counterpartyId: number | null;
  contractId: number | null;
  /** The settlement document the money settles (1C «Документ расчетов»); empty: the oldest debts first. */
  relatedDocumentId: number | null;
  /** RKO only: the cash box the money is handed to (a transfer, no counterparty). */
  destinationCashBoxId: number | null;
  /** The employee the money settles with (an accountable person, 4220 ...). */
  employeeId: number | null;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number | null;
  comment: string;
  cashChartAccountId: number | null;
  offsetAccountId: number | null;
  /** The operation kind (1C «Вид операции»); none on a transfer between boxes. */
  operationKindId: number | null;
}
