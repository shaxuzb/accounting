import type { FaRevaluationLine, FaRevaluationPayload } from "./type";

export interface FaRevaluationLineValues
  extends Omit<
    FaRevaluationLine,
    "assetAccountId" | "accumulatedDepreciationAccountId"
  > {
  assetAccountId: number | null;
  accumulatedDepreciationAccountId: number | null;
}

export interface FaRevaluationFormValues
  extends Omit<
    FaRevaluationPayload,
    "revaluationReserveAccountId" | "revaluationLossAccountId" | "lines"
  > {
  revaluationReserveAccountId: number | null;
  revaluationLossAccountId: number | null;
  lines: FaRevaluationLineValues[];
}

