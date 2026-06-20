export interface SaleDoc {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyId: number;
  counterpartyName: string;
  warehouseId: number;
  warehouseName: string;
  currencyId: number;
  currencyName: string;
  comment: string;
  stateId?: number;
  stateName?: string;
  statusId?: number;
  statusName?: string;
  totalAmount: number;
  createdDate?: string;
  lines?: SaleDocLineForm[];
}

export interface SaleDocForm {
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string;
  docDate: string;
  stateId?: number;
  lines: SaleDocLineForm[];
}
export interface SaleDocLineForm {
  productTableId: number;
}

export interface SaleDocUpdateLineForm {
  productId: number;
  markingNumber: string;
  serialNumber?: string | null;
  price: number;
  vatRateId: number | null;
}

export interface SaleDocUpdateForm {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string;
  stateId: number;
  lines: SaleDocUpdateLineForm[];
}

export interface SaleDocTable {
  id: number;
  ownerId: number;
  productTableId: number;
  productId?: number;
  productName: string;
  barcode: string;
  serialNumber?: string;
  unitName?: string;
  quantity: number;
  price: number;
  vatRateId: number | null;
  vatRateName?: string;
  availableQuantity?: number;
  totalAmount: number;
  syncStatus?: "pending" | "confirmed" | "error";
  errorMessage?: string;
}

export interface SaleDocTableForm {
  ownerId: number;
  productTableId: number;
  quantity: number;
  price: number;
  vatRateId: number | null;
}

export interface SaleProductLookup {
  productId: number;
  productTableId: number;
  barcode: string;
  serialNumber?: string;
  productName: string;
  unitName?: string;
  price: number;
  availableQuantity?: number;
  currencyId?: number;
  vatRateId: number | null;
}

export interface SaleDocListParams {
  CounterpartyId?: number;
  WarehouseId?: number;
  StatusId?: number;
  DateFrom?: string;
  DateTo?: string;
  Search?: string;
  Page?: number;
  PageSize?: number;
}
