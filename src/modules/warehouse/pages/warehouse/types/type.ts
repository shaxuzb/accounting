// Swagger: /api/product-stocks/groups
export interface ProductStockGroup {
  id: number;
  name: string;
  quantity: number;
  costPrice: number;
  totalAmount: number;
  currencyCode?: string;
  currencyName?: string;
}

// Swagger: /api/product-stocks/products
export interface ProductStock {
  id: number;
  productId: number;
  name?: string;
  productName?: string;
  barcode?: string;
  sapCode?: string;
  unitName?: string;
  productGroupName?: string;
  quantity: number;
  price?: number;
  salePrice?: number;
  costPrice?: number;
  totalAmount: number;
  currencyCode?: string;
  mxik: string;
}

// Swagger: /api/product-stocks/tables
export interface ProductStockSerial {
  id: number;
  productId: number;
  productName?: string;
  serialNumber?: string | null;
  markingNumber?: string | null;
}
