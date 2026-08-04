export interface FaMovementAssetLine {
  faAssetId: number;
  fromDepartmentId?: number;
  fromResponsibleUserId?: number;
  note: string;
}

export interface FaMovementAssetLineResponse extends FaMovementAssetLine {
  faAssetName?: string;
  faAssetInventoryNumber?: string;
  assetName?: string;
  inventoryNumber?: string;
  fromDepartmentId?: number;
  fromDepartmentName?: string;
  previousDepartmentId?: number;
  previousDepartmentName?: string;
  oldDepartmentId?: number;
  oldDepartmentName?: string;
  departmentId?: number;
  departmentName?: string;
  fromResponsibleUserId?: number;
  fromResponsibleUserName?: string;
  previousResponsibleUserId?: number;
  previousResponsibleUserName?: string;
  oldResponsibleUserId?: number;
  oldResponsibleUserName?: string;
  responsibleUserId?: number;
  responsibleUserName?: string;
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
  organizationName?: string;
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
