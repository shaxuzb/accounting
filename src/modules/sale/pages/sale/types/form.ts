export interface SaleDocForm {
  docDate: string;
  counterpartyId: number | null;
  warehouseId: number | null;
  currencyId: number | null;
  comment: string;
  stateId?: number | null;
}

export interface SaleDocProductForm {
  id?: number | null;
  productId: number;
  quantity: number;
  unitPrice: number;
  vatRateId: number | null;
}

export interface SaleDocCreateForm {
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string | null;
  products: SaleDocProductForm[];
}

export interface SaleDocUpdateForm {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string | null;
  stateId: number;
  products: SaleDocProductForm[];
}

export interface SaleDocTableUpdateForm {
  ownerId: number;
  productTableId: number;
  amount: number;
  vatRateId: number | null;
}

export interface SaleDocConfirmLineForm {
  id: number;
  amount: number;
}

export interface SaleDocConfirmForm {
  lines: SaleDocConfirmLineForm[];
}

export interface SaleDocWarehouseConfirmItemForm {
  productTableId: number;
}

export interface SaleDocWarehouseConfirmForm {
  items: SaleDocWarehouseConfirmItemForm[];
}

export interface SaleProductGroupForm {
  vatRateId: number | null;
  vatRateName: string;
  priceMode: "marginPercent" | "marginAmount" | "salePrice";
  margin: number | null;
  marginAmount: number | null;
  salePrice: number | null;
}
