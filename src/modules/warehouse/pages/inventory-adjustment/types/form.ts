export interface InventoryAdjustmentForm {
  docDate: string;
  warehouseId: number | null;
  adjustmentType: string;
  comment: string;
  /** Write-off / surplus account (1C «Счет списания» / «Счет доходов»); empty — the setting's. */
  offsetAccountId: number | null;
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
  /** Surplus price of one unit (1C «Оприходование»: Цена); empty takes the last receipt cost. */
  unitCost?: number | null;
  comment: string;
  items: InventoryAdjustmentItemForm[];
}
