export interface FaAssetUpdatePayload {
  inventoryNumber: string;
  name: string;
  faGroupId: number;
  okofId: number | null;
}

export interface FaAssetFormValues {
  inventoryNumber: string;
  name: string;
  faGroupId: number | null;
  okofId: number | null;
}
