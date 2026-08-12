export interface FaCommissioningLine {
  faAssetId: number;
  deprStartDate: string;
  salvageValue: number;
  usefulLifeMonths: number;
  depreciationMethodId: number;
  plannedUnitsTotal: number | null;
  departmentId: number;
  responsibleUserId: number;
  accumulatedDepreciationAccountId: number;
  depreciationExpenseAccountId: number;
  note: string | null;
  faAssetName?: string;
  faAssetInventoryNumber?: string;
  departmentName?: string;
  responsibleUserName?: string;
  depreciationMethodName?: string;
}

export interface FaCommissioningPayload {
  docDate: string;
  note: string;
  lines: FaCommissioningLine[];
}

export interface FaCommissioning extends FaCommissioningPayload {
  id: number;
  organizationName?: string;
  docNumber?: string;
  documentNumber?: string;
  documentDate?: string;
  statusId: number;
  statusName?: string;
  stateId?: number;
  stateName?: string;
  createdDate?: string;
}
