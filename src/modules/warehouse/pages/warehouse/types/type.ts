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

/**
 * /api/product-stocks/products har bir mahsulot uchun partiyalarini ham
 * qaytaradi. Tannarx aynan shu yerda — mahsulotning o'zida `costPrice` degan
 * maydon yo'q.
 */
export interface ProductStockBatch {
  batchId: number;
  batchNumber?: string;
  receivedDate?: string;
  documentId?: number;
  quantity: number;
  reservedQuantity?: number;
  blockedQuantity?: number;
  availableQuantity: number;
  unitCost: number;
}

// Swagger: /api/product-stocks/products
export interface ProductStock {
  id: number;
  productId: number;
  batches?: ProductStockBatch[];
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
