import type { FaMovementAssetLine, FaMovementPayload } from "./type";

export interface FaMovementLineValues
  extends Omit<FaMovementAssetLine, "faAssetId"> {
  faAssetId: number | null;
}

export interface FaMovementFormValues
  extends Omit<
    FaMovementPayload,
    "toDepartmentId" | "toResponsibleUserId" | "lines"
  > {
  toDepartmentId: number | null;
  toResponsibleUserId: number | null;
  lines: FaMovementLineValues[];
}
