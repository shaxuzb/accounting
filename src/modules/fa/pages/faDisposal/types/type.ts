export interface FaDisposalLineItem {
  faAssetId: number;
  saleAmount: number;
  note: string;
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
  lines: FaDisposalLineItem[];
  organizationId?: number;
  organizationName?: string;
}

export interface FaDisposalPayload {
  disposalDate: string;
  disposalType: string;
  reason: string;
  stateId: number;
  lines: FaDisposalLineItem[];
}
