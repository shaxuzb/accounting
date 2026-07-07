export interface InventoryAdjustmentForm {
  docDate: string;
  warehouseId: number | null;
  adjustmentType: string;
  comment: string;
  lines: InventoryAdjustmentLineForm[];
}

export interface InventoryAdjustmentItemForm {
  productTableId: number | null;
  costPrice: number | null;
  markingNumber?: string | null;
  serialNumber?: string | null;
}

export interface InventoryAdjustmentLineForm {
  productId: number | null;
  productName?: string | null;
  unitId: number | null;
  unitName?: string | null;
  quantity: number | null;
  comment: string;
  items: InventoryAdjustmentItemForm[];
}
