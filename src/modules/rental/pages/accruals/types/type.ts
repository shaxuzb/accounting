export interface RentalAccrualListItem {
  id: number;
  contractId: number;
  contractNumber: string;
  lessorFullName: string;
  docNumber: string;
  docDate: string;
  currencyCode?: string;
  taxAmount: number;
  payableAmount: number;
  amount: number;
  statusId: number;
  statusName?: string;
}

export interface RentalAccrualItem {
  id: number;
  contractObjectId: number;
  objectName: string;
  periodFrom: string;
  periodTo: string;
  contractAmount: number;
  taxBaseAmount: number;
  taxRate: number;
  taxAmount: number;
  payableAmount: number;
  amount: number;
  expenseAccountId?: number | null;
  expenseAccountNumber?: string | number | null;
  expenseAccountName?: string | null;
}

export interface RentalAccrualDetail extends RentalAccrualListItem {
  organizationId?: number;
  lessorInn?: string | null;
  lessorPinfl?: string | null;
  currencyId: number;
  exchangeRate: number;
  contractAmount: number;
  taxBaseAmount: number;
  lessorPayableAccountId?: number | null;
  lessorPayableAccountNumber?: string | number | null;
  lessorPayableAccountName?: string | null;
  taxPayableAccountId?: number | null;
  taxPayableAccountNumber?: string | number | null;
  taxPayableAccountName?: string | null;
  comment?: string | null;
  createdDate?: string;
  postedAt?: string | null;
  cancelledAt?: string | null;
  items: RentalAccrualItem[];
}

export interface RentalAccrualUpdatePayload {
  exchangeRate: number;
  lessorPayableAccountId: number | null | undefined;
  taxPayableAccountId: number | null | undefined;
  comment: string | null;
  items: Array<{ itemId: number; expenseAccountId: number | null | undefined }>;
}

export interface RentalGenerateDuePayload {
  asOfDate?: string | null;
}

export interface RentalGenerateDueResult {
  createdDocumentCount: number;
  createdItemCount: number;
  documentIds: number[];
}
