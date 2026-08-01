import type { FaDisposalLineItem, FaDisposalPayload } from "./type";

export interface FaDisposalLineValues
  extends Omit<
    FaDisposalLineItem,
    "assetAccountId" | "accumulatedDepreciationAccountId"
  > {
  assetAccountId: number | null;
  accumulatedDepreciationAccountId: number | null;
}

export interface FaDisposalFormValues
  extends Omit<
    FaDisposalPayload,
    | "disposalAccountId"
    | "customerAccountId"
    | "vatAccountId"
    | "gainAccountId"
    | "lossAccountId"
    | "lines"
  > {
  disposalAccountId: number | null;
  customerAccountId: number | null;
  vatAccountId: number | null;
  gainAccountId: number | null;
  lossAccountId: number | null;
  lines: FaDisposalLineValues[];
}
