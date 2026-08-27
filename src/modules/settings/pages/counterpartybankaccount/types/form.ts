export interface CounterpartybankaccountForm {
  organizationId: number;
  counterpartyId: number;
  bankId: number;
  bankBranchId: number | null;
  accountNumber: string;
  currencyId: number;
  isMain: boolean;
  stateId?: number;
}
