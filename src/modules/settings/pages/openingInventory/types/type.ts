export interface SelectOption {
  id: number;
  name: string;
  code?: string;
}

export type OpeningInventoryMode = "goods" | "services";

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
  isService?: boolean;
  isPieceTracked?: boolean;
}

export interface ProductListResponse {
  items?: ProductSelectOption[];
  results?: ProductSelectOption[];
  data?: ProductSelectOption[];
}

export interface OpeningInventoryRow {
  key: number;
  id: number;
  indexId: number;
  name?: string;
  counterpartyId: number | null;
  product: string;
  productId: number | null;
  productName: string;
  qty: number | null;
  serialNumber: string;
  markingNumber: string;
  markingNumbers?: string[];
  price: number | null;
  pricePerUom?: number | null;
  isService?: boolean;
  unitId?: number | null;
  unitCode?: string | null;
  unitName?: string | null;
  mxik: string;
  vatRateId: number | null;
  vatRates: number | null;
  debitAccountId?: number | null;
  debitAccountName?: string;
  isPieceTracked?: boolean;
  [key: string]: unknown;
}

export interface OpeningInventoryListItem {
  id: number;
  docDate: string;
  counterpartyId: number;
  counterpartyName?: string;
  currencyId?: number | null;
  contractId: number;
  warehouseId: number;
  warehouseName?: string;
  totalAmount: number;
  comment: string;
  statusId?: number;
  statusName?: string;
  isService?: boolean;
  openingInventoryMode?: OpeningInventoryMode;
}

export interface OpeningInventoryDetailLine {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitId?: number;
  unitPrice: number;
  price?: number;
  amount: number;
  totalAmount?: number;
  vatRateId?: number | null;
  vatAmount?: number;
  debitAccountId?: number | null;
  vatAccountId?: number | null;
  debitAccountName?: string;
  vatAccountName?: string;
  items?: OpeningInventoryDetailLineItem[];
}

export interface OpeningInventoryDetailLineItem {
  id?: number;
  productId?: number;
  serialNumber?: string | null;
  markingNumber?: string | null;
}

export interface OpeningInventoryDetailData extends OpeningInventoryListItem {
  lines: OpeningInventoryDetailLine[];
  supplierAccountId?: number | null;
  serviceLines?: OpeningInventoryDetailLine[];
}
