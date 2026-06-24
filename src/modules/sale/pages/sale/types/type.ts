export interface SaleDoc {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyId: number;
  counterpartyName: string;
  warehouseId: number;
  warehouseName: string;
  currencyId: number;
  currencyCode: string;
  currencyName?: string;
  comment: string;
  stateId: number;
  stateName: string;
  statusId: number;
  statusName: string;
  totalAmount: number;
  createdDate: string;
  products?: SaleDocProduct[];
  lines?: SaleDocTable[];
}

export interface SaleDocProduct {
  id: number;
  ownerId?: number;
  productTableId?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitName?: string;
  unitPrice: number;
  costPrice?: number;
  price?: number;
  amount?: number;
  vatRateId: number | null;
  vatRateName?: string | null;
  vatAmount?: number;
  totalAmount?: number;
  tables?: SaleDocProductTable[];
}

export interface SaleDocProductTable {
  id: number;
  productTableId: number;
  markingNumber: string;
  serialNumber: string;
  costPrice: number;
  amount: number;
  vatRateId: number | null;
  vatRateName?: string | null;
  vatAmount: number;
  totalAmount: number;
}

export interface SaleDocTable {
  id: number;
  rowKey?: string;
  ownerId: number;
  productTableId: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  price: number;
  amount: number;
  vatRateId: number | null;
  vatRateName: string | null;
  vatAmount: number;
  totalAmount: number;
  markingNumber: string;
  serialNumber: string;
  unitName?: string;
}

export interface ProductTableByMarking {
  id?: number;
  productTableId?: number;
  productId: number;
  productName: string;
  markingNumber: string;
  serialNumber: string;
  unitName?: string;
  price?: number;
  vatRateId?: number | null;
}

export interface SaleProductStock {
  id: number;
  productId: number;
  productName?: string;
  name?: string;
  barcode?: string;
  sapCode?: string;
  quantity: number;
  unitName?: string;
  price?: number;
  salePrice?: number;
  totalAmount?: number;
  currencyCode?: string;
}

export interface SaleSelectedProduct {
  id?: number | null;
  productId: number;
  productName: string;
  quantity: number;
  availableQuantity: number;
  unitPrice: number;
  unitName?: string;
  vatRateId?: number | null;
}

export interface SaleScannedProduct {
  scanId: number;
  productTableId: number;
  productId: number;
  productName: string;
  markingNumber: string;
  serialNumber: string;
  unitName?: string;
  price?: number;
  vatRateId?: number | null;
  scanStatus: "pending" | "confirmed";
}

export interface SalePricingLine extends SaleDocTable {
  rowKey: string;
  marginPercent: number;
}

export interface SaleProductGroupData {
  key: string;
  productId: number;
  productName: string;
  lines: SalePricingLine[];
  totalQuantity: number;
}
