export interface PurchaseCurrencyTotal {
  currencyCode: string;
  currencyId: number;
  currencyName: string;
  totalDiscount: number;
  totalPrice: number;
  totalPriceWithDiscount: number;
}
export interface SelectBoxOptions {
  label: string;
  code: string;
  disabled: boolean;
  new?: boolean;
}
export interface PurchaseData {
  counterpartyId: number;
  counterpartyName: string;
  createdDate: string;
  currencyId: number;
  currencyName: string;
  docDate: string;
  docNumber: string;
  finalAmount: number;
  id: number;
  organizationId: number;
  stateId: number;
  stateName: string;
  statusId: number;
  statusName: string;
  totalAmount: number;
  warehouseId: number;
  warehouseName: string;
}

export interface PurchaseQuery {
  results: PurchaseData[];
  count: number;
}

export interface PurchaseDetailProductData {
  key: number;
  indexId: number;
  id: number;
  product: string;
  productId: number;
  productName: string;
  name?: string;
  sapCode: string;
  qty: number;
  quantity?: number;
  counterpartyId: number | null;
  price: number;
  serialNumber: string;
  markingNumber: string;
  currencyId: number;
  currency?: string;
  isSerial?: boolean;
  vatRateId: number | null;
  vatRates: number | null;
}
export interface PurchaseImportRow {
  key: number;
  id: number;
  indexId: number;
  name?: string;
  counterpartyId: number | null;
  product: string;
  productId: number | null;
  productName: string;
  sapCode: string;
  qty: number;
  serialNumber: string;
  currencyId: number;
  currency?: string;
  markingNumber: string;
  price: number;
  vatRateId: number | null;
  vatRates: number | null;
  isSerial?: boolean;
  [key: string]: unknown;
}
export interface PurchasePayment {
  id: number;
  amount: number;
  paymentDate: string;
  currencyId: number;
  currency: string;
  currencyCode?: string;
}

export interface PurchaseDetailLine {
  amount: number;
  id: number;
  ownerId: number;
  price: number;
  productName: string;
  productTableId: number;
  quantity: number;
  totalAmount: number;
  vatAmount: number;
  vatRateId: number;
  vatRateName: string;
}

export interface PurchaseDetailData extends PurchaseData {
  comment: string;
  lines: PurchaseDetailLine[];
  organizationName: string;
  vatAmount: number;
}

export interface PurchaseForm {
  docDate: string;
  counterpartyId: number | null;
  warehouseId: number | null;
  currencyId: number | null;
  comment: string;
}
