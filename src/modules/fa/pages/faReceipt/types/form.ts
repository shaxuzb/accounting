import type {
  FaReceiptAsset,
  FaReceiptLineItem,
  FaReceiptPayload,
} from "./type";

export interface FaReceiptAssetValues
  extends Omit<
    FaReceiptAsset,
    | "assetAccountId"
    | "accumulatedDepreciationAccountId"
    | "depreciationExpenseAccountId"
  > {
  assetAccountId: number | null;
  accumulatedDepreciationAccountId: number | null;
  depreciationExpenseAccountId: number | null;
}

export interface FaReceiptLineValues
  extends Omit<
    FaReceiptLineItem,
    "capitalInvestmentAccountId" | "vatAccountId" | "assets"
  > {
  capitalInvestmentAccountId: number | null;
  vatAccountId: number | null;
  assets: FaReceiptAssetValues[];
}

export interface FaReceiptFormValues
  extends Omit<FaReceiptPayload, "supplierAccountId" | "lines"> {
  supplierAccountId: number | null;
  lines: FaReceiptLineValues[];
}
