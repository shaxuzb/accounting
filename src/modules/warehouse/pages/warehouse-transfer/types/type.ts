export interface WarehouseTransferItem {
  productTableId: number | null;
  costPrice: number | null;
  markingNumber?: string | null;
  serialNumber?: string | null;
}

export interface WarehouseTransferLine {
  productId: number | null;
  productName?: string | null;
  unitId: number | null;
  unitName?: string | null;
  quantity: number | null;
  comment?: string | null;
  items: WarehouseTransferItem[];
}

export interface WarehouseTransferDocument {
  id: number;
  docNumber?: string | null;
  docDate: string;
  sourceWarehouseId: number | null;
  sourceWarehouseName?: string | null;
  destinationWarehouseId: number | null;
  destinationWarehouseName?: string | null;
  comment?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
  postedAt?: string | null;
  cancelledAt?: string | null;
  lines?: WarehouseTransferLine[];
}
