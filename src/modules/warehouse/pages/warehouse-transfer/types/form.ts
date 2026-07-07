export interface WarehouseTransferForm {
  docDate: string;
  sourceWarehouseId: number | null;
  destinationWarehouseId: number | null;
  comment: string;
  lines: WarehouseTransferLineForm[];
}

export interface WarehouseTransferItemForm {
  productTableId: number | null;
  costPrice: number | null;
  markingNumber?: string | null;
  serialNumber?: string | null;
}

export interface WarehouseTransferLineForm {
  productId: number | null;
  productName?: string | null;
  unitId: number | null;
  unitName?: string | null;
  quantity: number | null;
  comment: string;
  items: WarehouseTransferItemForm[];
}
