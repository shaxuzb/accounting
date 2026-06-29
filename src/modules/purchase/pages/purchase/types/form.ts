import type { PurchaseImportRow } from "./type";

// Swagger DTO — PurchaseDocLineItemDto
export interface PurchaseDocLineItemDto {
  markingNumber: string | null;
  serialNumber: string | null;
}

// Swagger DTO — PurchaseDocLineDto
export interface PurchaseDocLineDto {
  productId: number;
  quantity: number;
  unitId: number;
  unitPrice: number;
  vatRateId: number | null;
  items?: PurchaseDocLineItemDto[];
}

export interface PurchaseImportForm {
  docDate: string;
  counterpartyId: number | null;
  currencyId: number | null;
  contractId: number | null;
  warehouseId: number | null;
  comment: string;
  lines: PurchaseImportRow[];
}

export type PurchaseImportHeaderDraft = Pick<
  PurchaseImportForm,
  | "docDate"
  | "counterpartyId"
  | "contractId"
  | "currencyId"
  | "warehouseId"
  | "comment"
>;

// Swagger DTO — PurchaseDocCreateDto
export interface PurchaseCreatePayload {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string | null;
  contractId: number | null;
  lines: PurchaseDocLineDto[];
}
