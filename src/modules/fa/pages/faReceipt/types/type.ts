export interface FaReceiptAsset {
  inventoryNumber: string;
  name: string;
  faGroupId: number;
  okofId: number | null;
  initialCost: number;
  assetAccountId: number;
  faGroupName?: string;
  okofName?: string;
}

export interface FaReceiptLineItem {
  name: string;
  quantity: number;
  price: number;
  vatRateId: number | null;
  capitalInvestmentAccountId: number;
  vatAccountId: number | null;
  assets: FaReceiptAsset[];
}

export interface FaReceiptPayload {
  docDate: string;
  /** 1 fixed assets, 2 intangible assets (1C «Поступление НМА»). */
  assetKindId: number;
  /** The supplier; none for a surplus found at an inventory. */
  counterpartyId: number | null;
  currencyId: number;
  receiptTypeId: number;
  supplierAccountId: number;
  /** The inventory whose surplus the receipt books (type 4). */
  inventoryDocId: number | null;
  lines: FaReceiptLineItem[];
}

export interface FaReceiptResponse extends FaReceiptPayload {
  id: number;
  documentNumber?: string;
  docNumber?: string;
  documentDate?: string;
  comment?: string;
  counterpartyName?: string;
  currencyName?: string;
  currencyCode?: string;
  receiptTypeName?: string;
  inventoryDocNumber?: string | null;
  supplierAccountNumber?: string;
  supplierAccountName?: string;
  statusId: number;
  statusName?: string;
  stateId?: number;
  stateName?: string;
  createdDate?: string;
  updatedDate?: string;
}
