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

export type PurchaseMode = "goods" | "services";

export interface SelectOption {
  id: number;
  name: string;
  code?: string;
}

export interface ProductSelectOption {
  id: number;
  code?: string;
  barcode?: string;
  name: string;
  mxik?: string;
  unitId?: number | null;
  unitCode?: string | null;
  unitName?: string | null;
  unit?: string | null;
  price?: number | null;
  purchasePrice?: number | null;
  pricePerUom?: number | null;
  isPieceTracked?: boolean;
  isService?: boolean;
}

export interface ProductListResponse {
  items?: ProductSelectOption[];
  results?: ProductSelectOption[];
  data?: ProductSelectOption[];
}
export interface PurchaseData {
  counterpartyId: number;
  counterpartyName: string;
  createdDate: string;
  currencyId: number;
  currencyCode?: string | null;
  currencyName: string;
  docDate: string;
  docNumber: string;
  externalDocNumber?: string | null;
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
  supplierAccountId?: number | null;
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
  mxik: string;
  /** Eski local draftlarni o'qish uchun. Yangi oqim bu maydonga yozmaydi. */
  sapCode?: string;
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
  /** Eski local draftlarni o'qish uchun. Yangi oqim bu maydonga yozmaydi. */
  sapCode?: string;
  qty: number | null;
  amount?: number | null;
  serialNumber: string;
  currencyId: number;
  currency?: string;
  markingNumber: string;
  markingNumbers?: string[];
  price: number | null;
  pricePerUom?: number | null;
  unitId?: number | null;
  unitCode?: string | null;
  unitName?: string | null;
  mxik: string;
  vatRateId: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  vatRates: number | null;
  debitAccountId?: number | null;
  vatAccountId?: number | null;
  debitAccountName?: string;
  vatAccountName?: string;
  isSerial?: boolean;
  isPieceTracked?: boolean;
  markingCount?: number;
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
  items?: PurchaseDetailLineItem[];
  ownerId: number;
  price: number;
  productId?: number;
  productMxik?: string | null;
  productName: string;
  productTableId: number;
  quantity: number;
  totalAmount: number;
  vatAmount: number;
  vatRateId: number;
  vatRateName: string;
  unitId?: number | null;
  unitCode?: string | null;
  unitName?: string | null;
  unitPrice: number;
  debitAccountId?: number | null;
  vatAccountId?: number | null;
  debitAccountName?: string;
  vatAccountName?: string;
}

export interface PurchaseDetailLineItem {
  id?: number;
  productId?: number;
  hasMarking?: boolean;
  markingCount?: number | null;
  serialNumber?: string | null;
  markingNumber?: string | null;
}

export interface PurchaseDetailServiceLine {
  id?: number;
  ownerId?: number;
  name: string;
  price: number;
  accountId: number;
  accountName?: string;
}

export interface PurchaseDetailData extends PurchaseData {
  comment: string;
  priceIncludesVat: boolean;
  isService?: boolean;
  lines: PurchaseDetailLine[];
  purchaseMode?: PurchaseMode;
  serviceLines?: PurchaseDetailServiceLine[];
  organizationName: string;
  vatAmount: number;
  supplierAccountId?: number | null;
  externalDocNumber?: string | null;
  externalId?: string | null;
}

export interface PurchaseForm {
  docDate: string;
  counterpartyId: number | null;
  warehouseId: number | null;
  currencyId: number | null;
  priceIncludesVat: boolean;
  comment: string;
  externalDocNumber?: string | null;
  externalId?: string | null;
}
