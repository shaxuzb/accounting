export interface OrgBankAccountsForm {
  organizationId: number;
  bankId: number;
  bankBranchId: number | null;
  accountNumber: string;
  currencyId: number;
  isMain: boolean;
  stateId?: number;
}
