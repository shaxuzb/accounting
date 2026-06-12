//product type
export interface ProductTypeProductsInitialValues {
  name: string;
  sapCode: string;
  supplierId: number | null;
  supplier?: string;
  idIndex?: number;
  description: string;
  isSerial: boolean;
  productUom: {
    supplierUomId: number | null;
    stockUomId: number | null;
    clientUomId: number | null;
    supplierToStockFactor: number | null;
    stockToClientFactor: number | null;
  };
  currencyId: number | null;
  stateId?: number | null;
  characteristics: {
    key: string;
    value: string;
  }[];
}
export interface ProductTypeInitialValues {
  name: string;
  description: string;
  supplierId: number | null;
  products: ProductTypeProductsInitialValues[];
  id?: number | null;
  stateId?: number | null;
}
// products
export interface ProductsInitialValues {
  idIndex?: number;
  name: string;
  sapCode: string;
  description: string;
  productTypeId: number | null;
  supplierId: number | null;
  supplier?: string;
  unitPrice: number | null;
  currencyId: number | null;
  isSerial: boolean;
  productUom: {
    supplierUomId: number | null;
    stockUomId: number | null;
    clientUomId: number | null;
    supplierToStockFactor: number | null;
    stockToClientFactor: number | null;
  };
  id?: number | null;
  stateId?: number | null;
  charasteristics: {
    key: string;
    value: string;
  }[];
}


