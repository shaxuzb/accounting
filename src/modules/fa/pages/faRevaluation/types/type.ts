export interface FaRevaluationLine {
  faAssetId: number | null;
  newValue: number | string;
  note: string;
  assetAccountId: number;
  accumulatedDepreciationAccountId: number;
}

export interface FaRevaluationPayload {
  revaluationDate: string;
  reason: string;
  stateId: number;
  revaluationReserveAccountId: number;
  revaluationLossAccountId: number;
  lines: FaRevaluationLine[];
}

export interface FaRevaluation extends Omit<FaRevaluationPayload, "stateId"> {
  id: number;
  stateId?: number;
  stateName?: string;
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
}

