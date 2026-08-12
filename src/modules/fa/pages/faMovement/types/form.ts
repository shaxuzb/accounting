export interface FaMovementLineValues {
  faAssetId: number | null;
  note: string;
}

export interface FaMovementFormValues {
  docDate: string;
  toDepartmentId: number | null;
  toResponsibleUserId: number | null;
  note: string;
  lines: FaMovementLineValues[];
}
