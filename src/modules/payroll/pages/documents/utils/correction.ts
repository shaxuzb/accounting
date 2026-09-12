export type ManualAdjustmentMode = "AMOUNT" | "TARGET";

export interface ManualAdjustmentDraft {
  employeeId: number | null;
  componentId: number | null;
  mode: ManualAdjustmentMode;
  value: number | null;
  note: string | null;
}

/** Maps the UI's single-value correction input to the backend XOR contract. */
export const normalizeManualAdjustment = (draft: ManualAdjustmentDraft) => ({
  employeeId: draft.employeeId,
  componentId: draft.componentId,
  amount: draft.mode === "AMOUNT" ? draft.value : undefined,
  targetAmount: draft.mode === "TARGET" ? draft.value : undefined,
  note: draft.note,
});
