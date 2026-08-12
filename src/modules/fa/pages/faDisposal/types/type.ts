export interface FaDisposalLineItem {
  faAssetId: number;
  saleAmount: number;
  note: string;
  faAssetInventoryNumber?: string;
  inventoryNumber?: string;
  faAssetName?: string;
  assetName?: string;
  assetAccountNumber?: string;
  assetAccountName?: string;
  accumulatedDepreciationAccountNumber?: string;
  accumulatedDepreciationAccountName?: string;
  assetAccountId?: number;
  accumulatedDepreciationAccountId?: number;
}

export interface FaDisposalResponse {
  id: number;
  disposalDate: string;
  disposalTypeId: number;
  disposalTypeName?: string;
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
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
  disposalAccountNumber?: string;
  disposalAccountName?: string;
  customerAccountNumber?: string;
  customerAccountName?: string;
  vatAccountNumber?: string;
  vatAccountName?: string;
  gainAccountNumber?: string;
  gainAccountName?: string;
  lossAccountNumber?: string;
  lossAccountName?: string;
}

export interface FaDisposalPayload {
  disposalDate: string;
  disposalTypeId: number;
  reason: string;
  stateId: number;
  disposalAccountId: number;
  customerAccountId: number;
  vatAccountId: number;
  gainAccountId: number;
  lossAccountId: number;
  lines: FaDisposalLineItem[];
}
