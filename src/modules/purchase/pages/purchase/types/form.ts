import type { PurchaseImportRow } from "./type";

export interface PurchaseDocLineForm {
  productId: number;
  markingNumber: string | null;
  serialNumber: string | null;
  qty: number;
  price: number;
  vatRateId: number | null;
}

export interface PurchaseServiceLineForm {
  serviceId: number;
  serviceName?: string;
  price: number;
}

export interface PurchaseImportForm {
  docDate: string;
  counterpartyId: number | null;
  currencyId: number | null;
  contractId: number | null;
  warehouseId: number | null;
  comment: string;
  lines: PurchaseImportRow[];
  serviceLines: PurchaseServiceLineForm[];
  // newSerialProducts: Array<{
  //   productId: number | null;
  //   serialNumber: string;
  //   markingNumber: string;
  //   price: number;
  //   discountPercent: number;
  // }>;
}

export interface PurchaseCreatePayload {
  docDate: string;
  counterpartyId: number;
  currencyId: number;
  contractId: number | null;
  warehouseId: number;
  comment: string | null;
  lines: PurchaseDocLineForm[];
  serviceLines: PurchaseServiceLineForm[];
}
