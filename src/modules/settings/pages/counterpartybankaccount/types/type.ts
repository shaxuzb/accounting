export interface Counterpartybankaccount {
  id: number;
  organizationId: number;
  counterpartyId: number;
  counterpartyName: string;
  bankId: number;
  bankName: string;
  accountNumber: string;
  currencyId: number;
  currencyName: string;
  isMain: boolean;
  stateId: number;
  stateName: string;
  createdDate: string;
}
