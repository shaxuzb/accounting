

export interface InventoryCountItemForm {
  productTableId: number | null;
  barcode: string;
  serialNumber: string;
  markingNumber: string;
  costPrice: number | null;
}

export interface InventoryCountLineForm {
  productId: number | null;
  unitId: number | null;
  countedQuantity: number | null;
  defaultCostPrice: number | null;
  comment: string;
  items: InventoryCountItemForm[];
}



export interface InventoryCountForm {
  docDate: string;
  warehouseId: number | null;
  stateId: number | null;
  comment: string;
  isCountCompleted: boolean;
  lines: InventoryCountDocumentLineForm[];
}

export type InventoryCountDocumentLineForm = InventoryCountLineForm;
export type InventoryCountDocumentItemForm = InventoryCountItemForm;
