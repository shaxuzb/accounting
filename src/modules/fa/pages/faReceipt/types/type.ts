export interface FaReceiptAsset {
  inventoryNumber: string;
  name: string;
  faGroupId: number;
  okofId: number;
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
  counterpartyId: number;
  currencyId: number;
  receiptTypeId: number;
  supplierAccountId: number;
  lines: FaReceiptLineItem[];
}

export interface FaReceiptResponse extends FaReceiptPayload {
  id: number;
  documentNumber?: string;
  documentDate?: string;
  comment?: string;
  counterpartyName?: string;
  currencyName?: string;
  receiptTypeName?: string;
  supplierAccountNumber?: string;
  supplierAccountName?: string;
  statusId: number;
  statusName?: string;
  stateId?: number;
  stateName?: string;
  createdDate?: string;
  updatedDate?: string;
}
