import type { FaReceiptPayload } from "./type";

export interface FaReceiptAssetValues {
  inventoryNumber: string;
  name: string;
  faGroupId: number | null;
  okofId: number | null;
  initialCost: number | null;
  assetAccountId: number | null;
}

export interface FaReceiptLineValues {
  name: string;
  quantity: number;
  price: number;
  vatRateId: number | null;
  capitalInvestmentAccountId: number | null;
  vatAccountId: number | null;
  assets: FaReceiptAssetValues[];
}

export interface FaReceiptFormValues
  extends Omit<FaReceiptPayload, "counterpartyId" | "currencyId" | "receiptTypeId" | "supplierAccountId" | "lines"> {
  counterpartyId: number | null;
  currencyId: number | null;
  receiptTypeId: number | null;
  supplierAccountId: number | null;
  lines: FaReceiptLineValues[];
}
