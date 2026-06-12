// product
export interface ProductData {
  name: string;
  sapCode: string;
  supplierId: number;
  baseUomId: number;
  uomCategoryId: number;
  description: string;
  id: number;
  isSerial: boolean;
  characteristics: {
    key: string;
    value: string;
  }[];
  price: number;
  quantity: number;
  new: boolean;
  uom: string;
  uomId: number;
}
export interface ProductQueryProps {
  results: ProductData[];
  count: number;
}
// product uom
export interface ProductUomData {
  name: string;
  description: string;
}
export interface ProductUomQueryProps {
  results: ProductUomData[];
  count: number;
}
// product type
export interface ProductTypeData {
  id: number;
  state: string;
  stateId: number;
  supplierId: number;
  name: string;
  products: ProductData[];
  photoUrl: string;
  description: string;
}
export interface ProductTypeQueryProps {
  results: ProductTypeData[];
  count: number;
}

//stock data

export interface StockData {
  id: number;
  name: string;
  quantity: number;
  productPrices: {
    currency: string;
    currencyId: number;
    quantity: number;
    totalPurchasePrice: number;
    totalSalePrice: number;
  }[];
  totalAmount: number;
}

//stock product data

export interface StockProductData {
  id: number;
  name: string;
  sapCode: string;
  purchasePrice: number;
  totalPrice: number;
  totalPurchasePrice: number;
  totalSalePrice: number;
  isSerial: boolean;
  salePrice: number;
  currencyId: number;
  currency: string;
  quantity: number;
  operationQuantity: number;
  unitPrice: number;
  remainder: number;
  baseUomId: number;
  baseUomName: string;
  baseUomSymbol: string;
  goodsMovementProductTables: StockProductSerialData[];
  uom: string;
  characteristics: {
    key: string;
    value: string;
  }[];
  operationUom: { id: number; name: string; symbol: string; factor: number };

  stockUom: { id: number; name: string; symbol: string; factor: number };
  uomId: number;
  uomSymbol: string;
}

//stock product serial data
export interface StockProductSerialData {
  id: number;
  productId: number;
  serialNumber: string;
  markingNumber: string;
  price: number;
  productTableId: number;
}

export interface StockProductSerialDataResponse {
  results: StockProductSerialData[];
}

export interface ProductTrackingHistory {
  id: number;
  productTableId: number;
  statusId: number;
  description: string;
  organizationId: number;
  supplierId: number | null;
  clientId: number | null;
  createdDate: string;
  createdUserId: number | null;
  client: string | null;
  supplier: string | null;
  organization: string | null;
  status: string;
  product: string;
  sapCode: string;
  from: string | null;
  sendTo: string | null;
  movementTypeId: number;
  docId: number;
  docNumber: string;
  eventDate: string;
}

export interface ProductTrackingData {
  id: number;
  price: number;
  markingNumber: string;
  serialNumber: string;
  productId: number;
  supplierId: number | null;
  wareHouseId: number | null;
  clientId: number | null;
  organizationId: number;
  arrivalDate: string;
  statusId: number;
  stateId: number;
  createdDate: string;
  createdUserId: number | null;
  currencyId: number;
  supplier: string | null;
  organization: string | null;
  product: string;
  sapCode: string;
  state: string;
  status: string;
  currency: string | null;
  wareHouse: string | null;
  client: string | null;
  productTableHistories: ProductTrackingHistory[];
}
