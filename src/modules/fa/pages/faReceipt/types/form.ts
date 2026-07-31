import type { FaReceiptPayload, FaReceiptLineItem, FaReceiptAsset } from "./type";

export type FaReceiptLineValues = FaReceiptLineItem;
export type FaReceiptAssetValues = FaReceiptAsset;
export interface FaReceiptFormValues extends Omit<FaReceiptPayload, 'lines'> {
  lines: FaReceiptLineValues[];
}
