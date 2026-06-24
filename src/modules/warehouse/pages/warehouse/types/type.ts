export interface ProductStock {
  id: number;
  name?: string;
  productName?: string;
  productTypeName?: string;
  productId?: number;
  barcode?: string;
  sapCode?: string;
  productGroupName?: string;
  unitName?: string;
  quantity: number;
  purchaseAmount?: number;
  saleAmount?: number;
  purchaseTotalAmount?: number;
  saleTotalAmount?: number;
  totalPurchaseAmount?: number;
  totalSaleAmount?: number;
  purchaseSum?: number;
  saleSum?: number;
  price: number;
  salePrice?: number;
  totalAmount: number;
  currencyCode?: string;
  currencyName?: string;
}

export interface ProductStockDetail {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalAmount: number;
}

export interface ProductStockSerial {
  id: number;
  productId: number;
  productName?: string;
  serialNumber?: string | null;
  markingNumber?: string | null;
}

export type WarehouseAll = ProductStock;
export type WarehouseDetail = ProductStockDetail;
export type ProductTableByMarking = ProductStockSerial;
