export interface FaMovementAssetLine {
  faAssetId: number;
  note: string | null;
}

export interface FaMovementAssetLineResponse extends FaMovementAssetLine {
  faAssetName?: string;
  faAssetInventoryNumber?: string;
  inventoryNumber?: string;
  assetName?: string;
  fromDepartmentId?: number | null;
  fromDepartmentName?: string;
  fromResponsibleUserId?: number | null;
  fromResponsibleUserName?: string;
  previousDepartmentId?: number | null;
  previousDepartmentName?: string;
  previousResponsibleUserId?: number | null;
  previousResponsibleUserName?: string;
}

export interface FaMovementPayload {
  docDate: string;
  toDepartmentId: number | null;
  toResponsibleUserId: number | null;
  note: string;
  lines: FaMovementAssetLine[];
}

export interface FaMovement extends FaMovementPayload {
  id: number;
  organizationName?: string;
  docNumber?: string;
  toDepartmentName?: string;
  toResponsibleUserName?: string;
  statusId: number;
  statusName?: string;
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
  stateId?: number;
  stateName?: string;
  lines: FaMovementAssetLineResponse[];
}
