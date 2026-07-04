export interface CashDocumentForm {
  cashBoxId: number | null;
  paymentPurposeId: number | null;
  paymentTypeId: number | null;
  counterpartyId: number | null;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  exchangeRate: number | null;
  comment: string;
}
