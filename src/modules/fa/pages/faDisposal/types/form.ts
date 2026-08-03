import type { FaDisposalLineItem, FaDisposalPayload } from "./type";

export interface FaDisposalLineValues
  extends Omit<
    FaDisposalLineItem,
    "faAssetId" | "assetAccountId" | "accumulatedDepreciationAccountId"
  > {
  faAssetId: number | null;
  assetAccountId: number | null;
  accumulatedDepreciationAccountId: number | null;
}

export interface FaDisposalFormValues
  extends Omit<
    FaDisposalPayload,
    | "disposalTypeId"
    | "disposalAccountId"
    | "customerAccountId"
    | "vatAccountId"
    | "gainAccountId"
    | "lossAccountId"
    | "lines"
  > {
  disposalTypeId: number | null;
  disposalAccountId: number | null;
  customerAccountId: number | null;
  vatAccountId: number | null;
  gainAccountId: number | null;
  lossAccountId: number | null;
  lines: FaDisposalLineValues[];
}
