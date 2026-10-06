export interface PaymentAcceptancePointOperationForm {
  paymentAcceptancePointId: number | null;
  directionId: 1 | -1;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number;
  externalTransactionNumber: string;
  comment: string;
  /** The point's own account (5710 acquiring, 5720 cards). */
  pointAccountId: number | null;
  /** The other side of the movement. */
  offsetAccountId: number | null;
}

export interface PaymentAcceptancePointOperationRequest extends PaymentAcceptancePointOperationForm {
  relatedDocumentId?: never;
  statusId?: never;
}
