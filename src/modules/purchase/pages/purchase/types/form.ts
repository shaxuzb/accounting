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
  debitAccountId: number;
  vatAccountId: number;
  items?: PurchaseDocLineItemDto[];
}

export type PurchaseProcessingMode = 1 | 2;

export interface PurchaseDocumentPayload {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string | null;
  contractId: number | null;
  supplierAccountId: number;
  lines: PurchaseDocLineDto[];
  externalDocNumber?: string | null;
  externalId?: string | null;
}

export interface PurchaseImportForm {
  docDate: string;
  counterpartyId: number | null;
  currencyId: number | null;
  contractId: number | null;
  warehouseId: number | null;
  supplierAccountId: number | null;
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
  | "supplierAccountId"
  | "comment"
>;

// Swagger DTO — PurchaseDocCreateDto
export interface PurchaseCreatePayload extends PurchaseDocumentPayload {
  processingMode: PurchaseProcessingMode;
}

export type PurchaseUpdatePayload = PurchaseDocumentPayload;
