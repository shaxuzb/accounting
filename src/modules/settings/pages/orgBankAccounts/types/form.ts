export interface OrgBankAccountsForm {
  organizationId: number;
  bankId: number;
  accountNumber: string;
  currencyId: number;
  isMain: boolean;
  stateId?: number;
}
