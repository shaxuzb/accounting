export interface OrgBankAccounts {
  id: number;
  organizationId: number;
  organizationName: string;
  bankId: number;
  bankName: string;
  bankBranchId?: number | null;
  bankBranchName?: string | null;
  accountNumber: string;
  currencyId: number;
  currencyName: string;
  isMain: boolean;
  chartAccountId?: number | null;
  stateId: number;
  stateName: string;
  createdDate: string;
}
