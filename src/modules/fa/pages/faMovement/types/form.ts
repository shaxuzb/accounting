export interface FaMovementLineValues {
  faAssetId: number | null;
  note: string;
}

export interface FaMovementFormValues {
  docDate: string;
  toDepartmentId: number | null;
  toResponsibleUserId: number | null;
  /** Where the assets' depreciation is charged from here on (1C «Способ отражения расходов»). */
  toDepreciationExpenseAccountId: number | null;
  note: string;
  lines: FaMovementLineValues[];
}
