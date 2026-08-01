export interface FaReceiptAsset {
  inventoryNumber: string;
  name: string;
  initialCost: number;
  salvageValue: number;
  usefulLifeMonths: number;
  depreciationMethodId: number;
  faGroupId: number;
  okofId: number;
  commissioningDate: string;
  deprStartDate: string;
  plannedUnitsTotal: number;
  departmentId: number;
  responsibleUserId: number;
  assetAccountId: number;
  accumulatedDepreciationAccountId: number;
  depreciationExpenseAccountId: number;
}

export interface FaReceiptLineItem {
  sourceProductId: number;
  name: string;
  quantity: number;
  price: number;
  vatRateId: number;
  capitalInvestmentAccountId: number;
  vatAccountId: number;
  assets: FaReceiptAsset[];
}

export interface FaReceiptPayload {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  receiptType: string;
  supplierAccountId: number;
  lines: FaReceiptLineItem[];
}

export interface FaReceiptResponse extends FaReceiptPayload {
  id: number;
  statusId?: number;
  statusName?: string;
  stateId?: number;
  stateName?: string;
  createdDate?: string;
  updatedDate?: string;
}
