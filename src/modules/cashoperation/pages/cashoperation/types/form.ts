export interface CashOperationForm {
  cashBoxId: number | null;
  cashOperationId: number | null;
  operationTypeId: number | null;
  counterpartyId: number | null;
  docDate: string;
  currencyId: number | null;
  amount: number | null;
  comment: string;
  stateId?: number | null;
}
