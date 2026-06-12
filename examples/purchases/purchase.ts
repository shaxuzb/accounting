import { StockProductSerialData } from "@/modules/warehouses/types/warehouse";

export interface PurchaseData {
  actionScope: string;
  actionScopeId: number;
  client: string;
  clientId: number;
  createdDate: string;
  createdUser: string;
  createdUserId: number;
  currency: string;
  currencyId: number;
  description: null;
  docDate: string;
  docNumber: string;
  totalPriceUZS: number;
  totalPriceUSD: number;
  totalDiscountUSD: number;
  statusCode: string;
  isActionAllowed: boolean;
  contractName: string;
  contractId: number;
  totalDiscountUZS: number;
  totoalPriceWithDiscountUSD: number;
  totoalPriceWithDiscountUZS: number;
  exchangeRate: number;
  id: number;
  movementType: string;
  movementTypeId: number;
  operationType: string;
  operationTypeId: number;
  state: string;
  stateId: number;
  status: string;
  statusId: number;
  supplier: string;
  prices: {
    currencyCode: string;
    currencyId: number;
    currencyName: string;
    totalDiscount: number;
    totalPrice: number;
    totoalPriceWithDiscount: number;
  }[];
  supplierId: number;
}
export type PurchaseDetailProductTableData = Record<string, unknown>;
export interface PurchaseDetailProductData {
  baseUom: string;
  baseUomId: number;
  name: string;
  conversionRate: number;
  conversionUom: string;
  conversionUomId: number;
  currency: string;
  priceWithDiscount: number;
  currencyId: number;
  discountPercent: number;
  id: number;
  isSerial: boolean;
  lineTotal: number;
  ownerId: number;
  pricePerUom: number;
  product: string;
  productId: number;
  qty: number;
  quantity: number;
  sapCode: string;
  characteristics: {
    key: string;
    value: string;
  }[];
  goodsMovementProductTables: StockProductSerialData[];
}
export interface PurchaseDetailData {
  id: number;
  docNumber: string;
  docDate: string;
  debtReturnDate: string;
  totalPriceUZS: number;
  contractName: string;
  contractId: number;
  totalPriceUSD: number;
  operationTypeId: number;
  actionScopeId: number;
  movementTypeId: number;
  currencyId: number;
  exchangeRate: number;
  description: string;
  stateId: number;
  createdUserId: number;
  createdDate: string;
  actionScope: string;
  createdUser: string;
  currency: string;
  movementType: string;
  operationType: string;
  state: string;
  status: string;
  statusId: number;
  clientId: number;
  supplierId: number;
  statusCode: string;
  isActionAllowed: boolean;
  client: string;
  supplier: string;
  payments: {
    id: number;
    amount: number;
    paymentDate: string;
    currencyId: number;
    currency: string;
    currencyCode?: string;
    accountId?: number | null;
    account?: string | null;
    description?: string | null;
    paymentSystemTypeId?: number | null;
    paymentSystemType?: string | null;
    isApplied?: boolean;
  }[];
  prices: {
    currencyCode: string;
    currencyId: number;
    currencyName: string;
    totalDiscount: number;
    totalPrice: number;
    totoalPriceWithDiscount: number;
  }[];
  saleGetSerials: { id: number; productId: number; serialNumber: string }[];
  goodsMovementProducts: PurchaseDetailProductData[];
  goodsMovementHistory: {
    description: string;
    id: number;
    modifiedDate: string;
    modifiedUser: string;
    modifiedUserId: number;
    ownerId: number;
    status: string;
    statusId: number;
  }[];
}
export interface PurchaseQueryProps {
  results: PurchaseData[];
  count: number;
}

export interface RevaluationHistoryData {
  productId: number;
  product: string;
  priceHistories: {
    id: number;
    currencyId: number;
    uomId: number;
    price: number;
    validFrom: string;
    validTo: string;
    currency: string;
    uom: string;
  }[];
}
export interface RevaluationData {
  id: number;
  productId: number;
  indexId: number;
  uomId: number;
  price: number;
  currencyId: number;
  validFrom: string;
  validTo: string;
  currency: string;
  product: string;
  characteristics: {
    key: string;
    value: string;
  }[];
  productType: string;
  productTypeId: number;
  uom: string;
  purchaseCurrency: string;
  purchaseCurrencyId: number;
  purchasePrice: number;
  purchasePriceId: number;
  purchaseUom: string;
  purchaseUomId: number;
  purchaseValidFrom: string;
  purchaseValidTo: string;
  saleCurrency: string;
  saleCurrencyId: number;
  salePrice: number;
  salePriceId: number;
  saleUom: string;
  saleUomId: number;
  saleValidFrom: string;
  saleValidTo: string;
}
export interface RevaluationQueryData {
  results: RevaluationData[];
  count: number;
}

export interface ComeProductSerialPayload {
  productId: number;
  serialNumber: string;
  markingNumber: string;
  price: number;
  discountPercent: number;
}

export interface ComeProductNonSerialPayload {
  productId: number;
  qty: number;
  pricePerUom: number;
  discountPercent: number;
}

export interface ComeProductCreatePayload {
  docDate: string;
  supplierId: number;
  requestCode: string;
  movementCode: "PURCHASE";
  newSerialProducts: ComeProductSerialPayload[];
  newProducts: ComeProductNonSerialPayload[];
}

export interface ComeProductListItem {
  id: number;
  docNumber: string;
  docSaleNumber?: string;
  docDate: string;
  goodsMovementId: number;
  supplier: string;
  supplierId: number;
  status: string;
  prices: {
    currencyCode: string;
    currencyId: number;
    currencyName: string;
    totalDiscount: number;
    totalPrice: number;
    totoalPriceWithDiscount: number;
  }[];
  statusId: number;
  state: string;
  stateId: number;
  totalPriceUZS?: number;
  totalPriceUSD?: number;
}

export interface ComeProductQuery {
  results: ComeProductListItem[];
  count: number;
}

export interface ComeProductDetail {
  id: number;
  docNumber: string;
  docSaleNumber?: string;
  docDate: string;
  supplier: string;
  supplierId?: number;
  supplierCode?: string;
  status: string;
  statusId: number;
  state: string;
  stateId: number;
  comeProductTables?: Array<{
    id: number;
    productId?: number;
    name?: string;
    product?: string;
    sapCode: string;
    serialNumber?: string | null;
    markingNumber?: string | null;
    price?: number;
    qty?: number;
    currencyId?: number;
  }>;
  goodsMovementProducts?: Array<{
    id: number;
    product: string;
    sapCode: string;
    productId: number;
    qty: number;
    pricePerUom: number;
    discountPercent: number;
    currencyId: number;
    serialNumber?: string | null;
    markingNumber?: string | null;
  }>;
}
