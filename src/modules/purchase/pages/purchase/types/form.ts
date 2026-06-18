import type { PurchaseImportRow } from "./type";

export interface PurchaseImportForm {
  docDate: string;
  counterpartyId: number | null;
  currencyId: number | null;
  contractId: number | null;
  warehouseId: number | null;
  comment: string;
  lines: PurchaseImportRow[];
  // newSerialProducts: Array<{
  //   productId: number | null;
  //   serialNumber: string;
  //   markingNumber: string;
  //   price: number;
  //   discountPercent: number;
  // }>;
}
