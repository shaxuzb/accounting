export interface Warehouse {
  id: number;
  organizationId: number;
  organizationName: string;
  branchId: number;
  branchName: string;
  code: string;
  name: string;
  responsibleUserId: number;
  responsibleUserName: string;
  stateId: number;
  stateName: string;
  createdDate: string;
  isMain?: boolean;
  address?: string | null;
  isRetail?: boolean;
  retailStockAccountId?: number | null;
  markupAccountId?: number | null;
}
