export interface PurchaseCurrencyTotal {
  currencyCode: string;
  currencyId: number;
  currencyName: string;
  totalDiscount: number;
  totalPrice: number;
  totoalPriceWithDiscount: number;
}

export interface PurchaseData {
  id: number;
  docNumber: string;
  docDate: string;
  supplier: string;
  supplierId: number;
  contractName?: string | null;
  status: string;
  statusId: number;
  state: string;
  stateId: number;
  prices: PurchaseCurrencyTotal[];
  isActionAllowed?: boolean;
}

export interface PurchaseQuery {
  results: PurchaseData[];
  count: number;
}

export interface PurchaseDetailProductData {
  id: number;
  product: string;
  productId: number;
  name?: string;
  sapCode: string;
  qty: number;
  quantity?: number;
  pricePerUom: number;
  discountPercent: number;
  currencyId: number;
  currency?: string;
  baseUom?: string;
  isSerial?: boolean;
  goodsMovementProductTables?: unknown[];
}

export interface PurchasePayment {
  id: number;
  amount: number;
  paymentDate: string;
  currencyId: number;
  currency: string;
  currencyCode?: string;
}

export interface PurchaseDetailData extends PurchaseData {
  debtReturnDate?: string;
  description?: string | null;
  client?: string;
  clientId?: number;
  operationType?: string;
  operationTypeId?: number;
  movementType?: string;
  movementTypeId?: number;
  payments?: PurchasePayment[];
  goodsMovementProducts: PurchaseDetailProductData[];
}

export interface PurchaseForm {
  docDate: string;
  supplierId: number | null;
  movementCode: "PURCHASE";
}
