export interface PurchaseImportForm {
  docDate: string;
  supplierId: number | null;
  movementCode: "PURCHASE";
  newProducts: Array<{
    productId: number | null;
    qty: number;
    pricePerUom: number;
    discountPercent: number;
  }>;
  newSerialProducts: Array<{
    productId: number | null;
    serialNumber: string;
    markingNumber: string;
    price: number;
    discountPercent: number;
  }>;
}