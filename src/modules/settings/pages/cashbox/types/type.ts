export interface CashBox {
  id: number;
  organizationId: number;
  organizationName: string;
  branchId: number;
  branchName: string;
  code: string;
  name: string;
  currencyId: number;
  currencyName: string;
  isMain?: boolean;
  responsibleUserId?: number | null;
  chartAccountId?: number | null;
  cashLimit?: number | null;
  stateId: number;
  stateName: string;
  createdDate: string;
}
