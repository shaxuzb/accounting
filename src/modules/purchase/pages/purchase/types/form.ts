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
  deferredExpenseItemId?: number | null;
  items?: PurchaseDocLineItemDto[];
}

export type PurchaseProcessingMode = 1 | 2;

export interface PurchaseDocumentPayload {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  /** UZS for one unit of the currency; 1 for UZS. */
  exchangeRate: number;
  comment: string | null;
  contractId: number | null;
  /** The power of attorney the goods were received by (NSBU 4 p. 100). */
  powerOfAttorneyId?: number | null;
  /** How the advances are offset (1C «Способ зачета аванса»): 1 automatic, 2 by document, 3 none. */
  advanceOffsetMode?: number;
  /** The advance offset when by document (a cmn_document_registry id). */
  advanceDocumentId?: number | null;
  supplierAccountId: number;
  /** The unit prices already contain VAT: it is extracted from them, not added on top. */
  priceIncludesVat: boolean;
  lines: PurchaseDocLineDto[];
  externalDocNumber?: string | null;
  externalId?: string | null;
}

export interface PurchaseImportForm {
  docDate: string;
  counterpartyId: number | null;
  currencyId: number | null;
  exchangeRate: number;
  contractId: number | null;
  /** The power of attorney the goods were received by (NSBU 4 p. 100). */
  powerOfAttorneyId?: number | null;
  /** How the advances are offset (1C «Способ зачета аванса»): 1 automatic, 2 by document, 3 none. */
  advanceOffsetMode?: number;
  /** The advance offset when by document (a cmn_document_registry id). */
  advanceDocumentId?: number | null;
  warehouseId: number | null;
  supplierAccountId: number | null;
  comment: string;
  priceIncludesVat: boolean;
  lines: PurchaseImportRow[];
}

export type PurchaseImportHeaderDraft = Pick<
  PurchaseImportForm,
  | "docDate"
  | "counterpartyId"
  | "contractId"
  | "currencyId"
  | "exchangeRate"
  | "warehouseId"
  | "supplierAccountId"
  | "comment"
  | "priceIncludesVat"
>;

// Swagger DTO — PurchaseDocCreateDto
export interface PurchaseCreatePayload extends PurchaseDocumentPayload {
  processingMode: PurchaseProcessingMode;
}

export type PurchaseUpdatePayload = PurchaseDocumentPayload;
