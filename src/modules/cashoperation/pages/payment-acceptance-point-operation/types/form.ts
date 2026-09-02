export interface PaymentAcceptancePointOperationForm {
  paymentAcceptancePointId: number | null;
  directionId: 1 | -1;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number;
  externalTransactionNumber: string;
  comment: string;
}

export interface PaymentAcceptancePointOperationRequest extends PaymentAcceptancePointOperationForm {
  relatedDocumentId?: never;
  statusId?: never;
}
