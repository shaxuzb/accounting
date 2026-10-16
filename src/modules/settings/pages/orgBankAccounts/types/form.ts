export interface OrgBankAccountsForm {
  organizationId: number;
  bankId: number;
  bankBranchId: number | null;
  accountNumber: string;
  currencyId: number;
  isMain: boolean;
  /** The bank account in the chart (5110.x / 5210 / 55xx), offered in its statements. */
  chartAccountId?: number | null;
  stateId?: number;
}
