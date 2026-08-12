import type { FaCommissioningPayload } from "./type";

export interface FaCommissioningLineValues {
  faAssetId: number | null;
  deprStartDate: string;
  salvageValue: number | null;
  usefulLifeMonths: number | null;
  depreciationMethodId: number | null;
  plannedUnitsTotal: number | null;
  departmentId: number | null;
  responsibleUserId: number | null;
  accumulatedDepreciationAccountId: number | null;
  depreciationExpenseAccountId: number | null;
  note: string;
}

export interface FaCommissioningFormValues
  extends Omit<FaCommissioningPayload, "lines"> {
  lines: FaCommissioningLineValues[];
}
