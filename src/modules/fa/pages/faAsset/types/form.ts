export interface FaAssetEditableFields {
  inventoryNumber: string;
  name: string;
  faGroupId: number | null;
  okofId: number | null;
  depreciationMethodId: number | null;
  usefulLifeMonths: number | null;
  initialCost: number | null;
  salvageValue: number | null;
  commissioningDate: string;
  deprStartDate: string;
  plannedUnitsTotal: number | null;
  sourceProductTableId: number | null;
  departmentId: number | null;
  responsibleUserId: number | null;
  assetAccountId: number | null;
  accumulatedDepreciationAccountId: number | null;
  depreciationExpenseAccountId: number | null;
}

export interface FaAssetFormValues extends FaAssetEditableFields {
  stateId: number | null;
  statusId: number;
}

export type FaAssetProcessingMode = 1 | 2;

export interface FaAssetCreatePayload extends FaAssetEditableFields {
  processingMode: FaAssetProcessingMode;
}

export interface FaAssetUpdatePayload extends FaAssetEditableFields {
  stateId: number | null;
  statusId: number;
}
