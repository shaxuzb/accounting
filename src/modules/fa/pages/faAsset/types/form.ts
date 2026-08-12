export interface FaAssetUpdatePayload {
  inventoryNumber: string;
  name: string;
  faGroupId: number;
  okofId: number;
}

export interface FaAssetFormValues {
  inventoryNumber: string;
  name: string;
  faGroupId: number | null;
  okofId: number | null;
}
