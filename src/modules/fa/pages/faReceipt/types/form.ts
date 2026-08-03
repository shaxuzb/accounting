import type {
  FaReceiptAsset,
  FaReceiptLineItem,
  FaReceiptPayload,
} from "./type";

export interface FaReceiptAssetValues
  extends Omit<
    FaReceiptAsset,
    | "depreciationMethodId"
    | "faGroupId"
    | "okofId"
    | "departmentId"
    | "responsibleUserId"
    | "assetAccountId"
    | "accumulatedDepreciationAccountId"
    | "depreciationExpenseAccountId"
  > {
  depreciationMethodId: number | null;
  faGroupId: number | null;
  okofId: number | null;
  departmentId: number | null;
  responsibleUserId: number | null;
  assetAccountId: number | null;
  accumulatedDepreciationAccountId: number | null;
  depreciationExpenseAccountId: number | null;
}

export interface FaReceiptLineValues
  extends Omit<
    FaReceiptLineItem,
    | "sourceProductId"
    | "vatRateId"
    | "capitalInvestmentAccountId"
    | "vatAccountId"
    | "assets"
  > {
  sourceProductId: number | null;
  vatRateId: number | null;
  capitalInvestmentAccountId: number | null;
  vatAccountId: number | null;
  assets: FaReceiptAssetValues[];
}

export interface FaReceiptFormValues
  extends Omit<
    FaReceiptPayload,
    | "counterpartyId"
    | "warehouseId"
    | "currencyId"
    | "receiptTypeId"
    | "supplierAccountId"
    | "lines"
  > {
  counterpartyId: number | null;
  warehouseId: number | null;
  currencyId: number | null;
  receiptTypeId: number | null;
  supplierAccountId: number | null;
  lines: FaReceiptLineValues[];
}
