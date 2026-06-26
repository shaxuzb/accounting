export interface BankOperationCreatePayload {
  bankAccountId: number;
  operationTypeId: number;
  counterpartyId: number;
  docDate: string;
  currencyId: number;
  amount: number;
  comment: string | null;
  stateId?: number
}
export interface BankOperationsCreatePayload {
  operations: BankOperationCreatePayload[];
}