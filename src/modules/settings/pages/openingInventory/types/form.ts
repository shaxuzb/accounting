import type { OpeningInventoryRow } from "./type";

export interface OpeningInventoryLineItemDto {
  markingNumber: string | null;
  serialNumber: string | null;
}

export interface OpeningInventoryLineDto {
  productId: number;
  quantity: number;
  unitId: number;
  unitPrice: number;
  amount: number;
  debitAccountId: number;
  items?: OpeningInventoryLineItemDto[];
}

export interface OpeningInventoryForm {
  docDate: string;
  counterpartyId: number | null;
  currencyId: number;
  contractId: number | null;
  warehouseId: number | null;
  comment: string;
  lines: OpeningInventoryRow[];
}

export type OpeningInventoryHeaderFields = Pick<
  OpeningInventoryForm,
  | "docDate"
  | "counterpartyId"
  | "currencyId"
  | "contractId"
  | "warehouseId"
  | "comment"
>;

export interface OpeningInventoryPayload {
  docDate: string;
  counterpartyId: number;
  contractId: number | null;
  warehouseId: number;
  totalAmount: number;
  comment: string | null;
  lines: OpeningInventoryLineDto[];
}
