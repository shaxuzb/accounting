export interface InventoryCountItemForm {
  productTableId: number | null;
  barcode?: string | null;
  serialNumber?: string | null;
  markingNumber?: string | null;
  costPrice: number | null;
}

export interface InventoryCountLineForm {
  productId: number | null;
  unitId: number | null;
  countedQuantity: number | null;
  defaultCostPrice: number | null;
  comment?: string | null;
  items: InventoryCountItemForm[];
}

export interface InventoryCountBaseForm {
  docDate: string;
  warehouseId: number | null;
  comment?: string | null;
  isCountCompleted: boolean;
  lines: InventoryCountLineForm[];
}

export interface InventoryCountForm {
  docDate: string;
  warehouseId: number | null;
  stateId: number | null;
  comment?: string | null;
  isCountCompleted: boolean;
  lines: InventoryCountLineForm[];
}

export type InventoryCountCreatePayload = Omit<InventoryCountForm, "stateId">;

export interface InventoryCountUpdatePayload extends InventoryCountBaseForm {
  stateId: number;
}

export type InventoryCountDocumentLineForm = InventoryCountLineForm;
export type InventoryCountDocumentItemForm = InventoryCountItemForm;
