// Swagger: /api/product-stocks/groups
export interface ProductStockGroup {
  id: number;
  name: string;
  quantity: number;
  costPrice: number;
  totalAmount: number;
  /** The stock at cost (quantity × average cost). */
  totalCostAmount: number;
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
  productMxik?: string | null;
  productGroupId?: number | null;
  batches?: ProductStockBatch[];
  name?: string;
  productName?: string;
  barcode?: string;
  sapCode?: string;
  unitId?: number | null;
  unitName?: string;
  /** Kept unit by unit with a marking code. */
  isPieceTracked?: boolean;
  productGroupName?: string;
  /** The minimum stock of the product's card: below it the goods are to be ordered. */
  minStock?: number | null;
  quantity: number;
  /** What may be taken: today's free stock, or on a date what later issues left of it. */
  availableQuantity?: number;
  /** With a date asked for: the stock's book value then, from the ledger. */
  costAmountOnDate?: number | null;
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
