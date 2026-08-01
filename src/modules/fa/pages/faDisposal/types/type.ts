export interface FaDisposalLineItem {
  faAssetId: number;
  saleAmount: number;
  note: string;
  assetAccountId: number;
  accumulatedDepreciationAccountId: number;
}

export interface FaDisposalResponse {
  id: number;
  disposalDate: string;
  disposalType: string;
  reason: string;
  stateId: number;
  stateName?: string;
  statusId?: number;
  statusName?: string;
  disposalAccountId: number;
  customerAccountId: number;
  vatAccountId: number;
  gainAccountId: number;
  lossAccountId: number;
  lines: FaDisposalLineItem[];
  organizationId?: number;
  organizationName?: string;
}

export interface FaDisposalPayload {
  disposalDate: string;
  disposalType: string;
  reason: string;
  stateId: number;
  disposalAccountId: number;
  customerAccountId: number;
  vatAccountId: number;
  gainAccountId: number;
  lossAccountId: number;
  lines: FaDisposalLineItem[];
}
