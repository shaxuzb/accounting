export interface PaymentAcceptancePointOperation {
  id: number;
  paymentAcceptancePointId: number;
  paymentAcceptancePointCode?: string | null;
  paymentAcceptancePointName?: string | null;
  directionId: number;
  directionName?: string | null;
  docNumber?: string | null;
  docDate: string;
  currencyId: number;
  currencyCode?: string | null;
  currencyName?: string | null;
  amount: number;
  exchangeRate: number;
  externalTransactionNumber?: string | null;
  relatedDocumentId?: number | null;
  relatedDocumentNumber?: string | null;
  statusId: number;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  comment?: string | null;
}

export interface PaymentAcceptancePointBalance {
  paymentAcceptancePointId: number;
  currencyId: number;
  asOfDate: string;
  balance: number;
}
