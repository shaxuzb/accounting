import type { FaDisposalLineItem } from "./type";

export interface FaDisposalFormValues {
  disposalDate: string;
  disposalType: string;
  reason: string;
  stateId: number;
  lines: FaDisposalLineItem[];
}
