export interface FaRevaluationLine {
  faAssetId: number;
  newValue: number | string;
  note: string;
}

export interface FaRevaluationLineResponse extends FaRevaluationLine {
  faAssetName?: string;
  faAssetInventoryNumber?: string;
  assetName?: string;
  inventoryNumber?: string;
  assetAccountName?: string;
  assetAccountNumber?: string;
  accumulatedDepreciationAccountName?: string;
  accumulatedDepreciationAccountNumber?: string;
  oldValue?: number;
  assetAccountId?: number;
  accumulatedDepreciationAccountId?: number;
}

export interface FaRevaluationPayload {
  revaluationDate: string;
  reason: string;
  stateId: number;
  revaluationReserveAccountId: number;
  revaluationLossAccountId: number;
  lines: FaRevaluationLine[];
}

export interface FaRevaluation
  extends Omit<FaRevaluationPayload, "stateId" | "lines"> {
  id: number;
  organizationName?: string;
  statusId?: number;
  statusName?: string;
  stateId?: number;
  stateName?: string;
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
  revaluationReserveAccountName?: string;
  revaluationReserveAccountNumber?: string;
  revaluationLossAccountName?: string;
  revaluationLossAccountNumber?: string;
  lines: FaRevaluationLineResponse[];
}

