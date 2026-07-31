export interface FaMovementAssetLine {
  faAssetId: number;
  note: string;
}

export interface FaMovementPayload {
  docDate: string;
  toDepartmentId: number;
  toResponsibleUserId: number;
  note: string;
  stateId?: number;
  lines: FaMovementAssetLine[];
}

export interface FaMovement extends FaMovementPayload {
  id: number;
  docNumber?: string;
  statusId?: number;
  statusName?: string;
  // For List Page compatibility
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
  stateId?: number;
  stateName?: string;
}
