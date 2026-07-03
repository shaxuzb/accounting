export interface InventoryAdjustmentItem {
  productTableId: number | null;
  costPrice: number | null;
  markingNumber?: string | null;
  serialNumber?: string | null;
  wasCreated?: boolean | null;
}

export interface InventoryAdjustmentLine {
  productId: number | null;
  productName?: string | null;
  unitId: number | null;
  unitName?: string | null;
  quantity: number | null;
  comment?: string | null;
  items: InventoryAdjustmentItem[];
}

export interface InventoryAdjustmentDocument {
  id: number;
  docNumber?: string | null;
  docDate: string;
  warehouseId: number | null;
  warehouseName?: string | null;
  adjustmentType: string;
  comment?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
  postedAt?: string | null;
  cancelledAt?: string | null;
  lines?: InventoryAdjustmentLine[];
}
