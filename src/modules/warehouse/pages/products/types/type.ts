// API DTO's based on swagger:
// ProductInGroupBaseDto - create payload item
// ProductInGroupUpdateDto - update payload item (+ id, stateId)
// ProductGroupCreateDto / ProductGroupUpdateDto - top-level group

export interface ProductItem {
  id?: number | null;
  idIndex?: number;
  code?: string;
  sku?: string;
  article?: string;
  name: string;
  unitId: number | null;
  mxik: string;
  description: string;
  isService: boolean;
  isPieceTracked?: boolean;
  isSold?: boolean;
  isPurchased?: boolean;
  productGroupId?: number | null;
  defaultVatRateId?: number | null;
  minStock?: number | null;
  // not in swagger group-item DTO, but kept for UI state
  stateId?: number | null;
  state?: string;
  new?: boolean;
  barcode?: string;
}

export interface ProductType {
  id: number;
  state: string;
  stateId: number;
  stateName: string;
  name: string;
  description?: string;
  isService?: boolean;
  products: ProductItem[];
  photoUrl?: string;
  createdDate: string
}

export interface ProductTypeForm {
  id?: number | null;
  stateId?: number | null;
  name: string;
  // ui-only — keeps the group locked to a single kind (true=services, false=products)
  isService: boolean;
  products: ProductItem[];
}

export interface ProductListResponse {
  items?: ProductType[];
  results?: ProductType[];
  total?: number;
  count?: number;
}

export interface ProductListParams {
  IsService?: boolean;
  Search?: string;
  Page?: number;
  PageSize?: number;
}
