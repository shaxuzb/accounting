import type { FaMovementAssetLine, FaMovementPayload } from "./type";

export interface FaMovementLineValues
  extends Omit<
    FaMovementAssetLine,
    "faAssetId" | "fromDepartmentId" | "fromResponsibleUserId"
  > {
  faAssetId: number | null;
  fromDepartmentId: number | null;
  fromResponsibleUserId: number | null;
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
