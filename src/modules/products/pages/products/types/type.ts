export interface ProductItemUom {
  supplierUomId: number | null;
  stockUomId: number | null;
  clientUomId: number | null;
  supplierToStockFactor: number | null;
  stockToClientFactor: number | null;
}

export interface ProductCharacteristic {
  key: string;
  value: string;
}

export interface ProductItem {
  id?: number | null;
  idIndex?: number;
  name: string;
  unitId: number;
  barCode: string;
  // supplierId: number | null;
  // supplier?: string;
  description: string;
  // isSerial: boolean;
  isService: boolean;
  // productUom: ProductItemUom;
  // currencyId: number | null;
  stateId?: number | null;
  state?: string;
  new?: boolean;
  // characteristics: ProductCharacteristic[];
}

export interface ProductType {
  id: number;
  state: string;
  stateId: number;
  supplierId: number | null;
  supplier?: string;
  name: string;
  products: ProductItem[];
  photoUrl?: string;
  description: string;
}

export interface ProductTypeForm {
  id?: number | null;
  stateId?: number | null;
  name: string;
  // description: string;
  // supplierId: number | null;
  organizationId: number | null;
  products: ProductItem[];
}

export interface ProductListResponse {
  items?: ProductType[];
  results?: ProductType[];
  total?: number;
  count?: number;
}
