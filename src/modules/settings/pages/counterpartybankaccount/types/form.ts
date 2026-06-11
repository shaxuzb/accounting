export interface CounterpartybankaccountForm {
  organizationId: number;
  counterpartyId: number;
  bankId: number;
  accountNumber: string;
  currencyId: number;
  isMain: boolean;
  stateId?: number;
}
