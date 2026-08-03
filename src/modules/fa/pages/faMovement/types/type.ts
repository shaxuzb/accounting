export interface FaMovementAssetLine {
  faAssetId: number;
  note: string;
}

export interface FaMovementAssetLineResponse extends FaMovementAssetLine {
  faAssetName?: string;
  faAssetInventoryNumber?: string;
  assetName?: string;
  inventoryNumber?: string;
}

export interface FaMovementPayload {
  docDate: string;
  toDepartmentId: number;
  toResponsibleUserId: number;
  note: string;
  stateId?: number;
  lines: FaMovementAssetLine[];
}

export interface FaMovement extends Omit<FaMovementPayload, "lines"> {
  id: number;
  docNumber?: string;
  toDepartmentName?: string;
  toResponsibleUserName?: string;
  statusId?: number;
  statusName?: string;
  // For List Page compatibility
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
  stateId?: number;
  stateName?: string;
  lines: FaMovementAssetLineResponse[];
}
