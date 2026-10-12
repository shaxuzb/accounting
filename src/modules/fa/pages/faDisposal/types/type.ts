export interface FaDisposalLineItem {
  faAssetId: number;
  saleAmount: number;
  /** Output VAT rate of a sale; the sale amount includes the VAT. */
  vatRateId?: number | null;
  vatAmount?: number;
  /** Revaluation reserve of the asset moved to retained earnings (8510 → 8710). */
  reserveTransfer?: number;
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
  assetKindId?: number;
  disposalTypeId: number;
  disposalTypeName?: string;
  reason: string;
  counterpartyId?: number | null;
  counterpartyName?: string;
  contractId?: number | null;
  contractNumber?: string;
  /** The inventory whose shortage the disposal books. */
  inventoryDocId?: number | null;
  inventoryDocNumber?: string | null;
  totalVatAmount?: number;
  totalReserveTransfer?: number;
  stateId: number;
  stateName?: string;
  statusId?: number;
  statusName?: string;
  disposalAccountId: number;
  customerAccountId: number | null;
  vatAccountId: number | null;
  gainAccountId: number;
  lossAccountId: number;
  lines: FaDisposalLineItem[];
  organizationId?: number;
  organizationName?: string;
  documentNumber?: string;
  docNumber?: string;
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
  /** 1 fixed assets, 2 intangible assets (1C «Списание / Передача НМА»). */
  assetKindId: number;
  disposalTypeId: number;
  reason: string;
  counterpartyId: number | null;
  contractId: number | null;
  inventoryDocId: number | null;
  stateId: number;
  disposalAccountId: number | null;
  customerAccountId: number | null;
  vatAccountId: number | null;
  gainAccountId: number | null;
  lossAccountId: number | null;
  lines: FaDisposalLineItem[];
}
