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
  lines: SaleDocTable[];
}

export interface SaleDocTable {
  id: number;
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
  marginPercent: number;
}

export interface SaleProductGroupData {
  key: string;
  productId: number;
  productName: string;
  lines: SalePricingLine[];
  totalQuantity: number;
}
