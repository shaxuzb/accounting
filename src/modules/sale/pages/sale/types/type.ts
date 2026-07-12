export interface SaleDoc {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyId: number;
  counterpartyName: string;
  contractId?: number | null;
  contractName?: string | null;
  warehouseId: number;
  warehouseName: string;
  currencyId: number;
  currencyCode: string;
  customerAccountId?: number | null;
  vatAccountId?: number | null;
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
  unitId?: number | null;
  unitPrice: number;
  costPrice?: number;
  price?: number;
  amount?: number;
  vatRateId: number | null;
  inventoryAccountId?: number | null;
  incomeAccountId?: number | null;
  costAccountId?: number | null;
  inventoryAccountName?: string;
  incomeAccountName?: string;
  costAccountName?: string;
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
  productMxik?: string;
  quantity: number;
  unitPrice?: number;
  costPrice: number;
  price: number;
  amount: number;
  vatRateId: number | null;
  vatRateName: string | null;
  inventoryAccountId?: number | null;
  incomeAccountId?: number | null;
  costAccountId?: number | null;
  inventoryAccountName?: string;
  incomeAccountName?: string;
  costAccountName?: string;
  vatAmount: number;
  totalAmount: number;
  markingNumber: string;
  serialNumber: string;
  unitName?: string;
  unitId?: number | null;
  purchaseDocNumber?: string;
  purchaseDate?: string;
  items?: SaleDocLineItem[];
}

export interface SaleDocLineItem {
  id: number;
  productTableId: number;
  markingNumber: string | null;
  serialNumber: string | null;
  costPrice: number;
  amount: number;
  vatRateId: number | null;
  vatRateName?: string | null;
  vatAmount: number;
  totalAmount: number;
  purchaseDocNumber?: string;
  purchaseDate?: string;
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
  mxik?: string;
  quantity: number;
  unitId?: number | null;
  unitName?: string;
  price?: number;
  salePrice?: number;
  costPrice?: number;
  totalAmount?: number;
  currencyCode?: string;
  isPieceTracked?: boolean;
}

export interface SaleSelectedProduct {
  id?: number | null;
  rowKey?: string;
  productId: number;
  productName: string;
  mxik?: string;
  quantity: number;
  availableQuantity: number;
  costPrice: number;
  unitId: number;
  unitPrice: number;
  inventoryAccountId: number | null;
  incomeAccountId: number | null;
  costAccountId: number | null;
  inventoryAccountName?: string;
  incomeAccountName?: string;
  costAccountName?: string;
  unitName?: string;
  vatRateId?: number | null;
  vatRateName?: string | null;
  markupPercent?: number;
  priceType?: "costPlusPercent" | "manual";
  isPieceTracked?: boolean;
  priceLayers?: SaleProductPriceLayer[];
  layers?: SaleProductPriceLayer[];
}

export interface SaleProductPriceLayer {
  id?: number | null;
  purchaseId?: number | null;
  productTableId?: number | null;
  productTableIds?: number[];
  purchaseDocNumber?: string;
  purchaseDate?: string;
  warehouseName?: string;
  availableQuantity: number;
  writeOffQuantity: number;
  costPrice: number;
  unitPrice: number;
  salePrice: number;
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
  markingCount: number;
  lines: SalePricingLine[];
  totalQuantity: number;
}

export interface SaleDocumentLineGroup {
  key: string;
  productId: number;
  productName: string;
  productMxik?: string;
  quantity: number;
  unitName?: string;
  unitPrice: number;
  amount: number;
  vatRateName?: string | null;
  vatAmount: number;
  totalAmount: number;
  lines: SaleDocTable[];
}
