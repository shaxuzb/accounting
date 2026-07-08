export interface InventoryCountItem {
  productTableId: number | null;
  barcode?: string | null;
  serialNumber?: string | null;
  markingNumber?: string | null;
  costPrice: number | null;
}

export interface InventoryCountLine {
  id?: number | null;
  ownerId?: number | null;
  productId: number | null;
  productName?: string | null;
  unitId: number | null;
  unitName?: string | null;
  countedQuantity: number | null;
  defaultCostPrice: number | null;
  comment?: string | null;
  items: InventoryCountItem[];
}

export interface InventoryCountDifference {
  productId: number | null;
  productName?: string | null;
  unitId?: number | null;
  unitName?: string | null;
  expectedQuantity?: number | null;
  countedQuantity?: number | null;
  correctQuantity?: number | null;
  missingQuantity?: number | null;
  foundQuantity?: number | null;
  missingProductTableIds?: number[];
  foundItems?: InventoryCountItem[];
}

export interface InventoryCountDocument {
  id: number;
  docNumber?: string | null;
  docDate: string;
  warehouseId: number | null;
  warehouseName?: string | null;
  comment?: string | null;
  isCountCompleted?: boolean;
  positiveAdjustmentDocId?: number | null;
  negativeAdjustmentDocId?: number | null;
  statusId?: number | null;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
  countCompletedByUserId?: number | null;
  countCompletedAt?: string | null;
  postedAt?: string | null;
  cancelledAt?: string | null;
  lines?: InventoryCountLine[];
}

export interface InventoryCountListFilter {
  search?: string;
  warehouseId?: number | null;
  statusId?: number | null;
  page?: number;
  pageSize?: number;
}

export type InventoryCountPostingBatch = Record<string, unknown>;

export type InventoryCountInventoryMovement = Record<string, unknown>;
