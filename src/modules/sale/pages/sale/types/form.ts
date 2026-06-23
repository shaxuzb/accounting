export interface SaleDocForm {
  docDate: string;
  counterpartyId: number | null;
  warehouseId: number | null;
  currencyId: number | null;
  comment: string;
  stateId?: number | null;
}

export interface SaleDocCreateLineForm {
  productTableId: number;
}

export interface SaleDocCreateForm {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string;
  lines: SaleDocCreateLineForm[];
}

export interface SaleDocUpdateLineForm {
  productId: number;
  markingNumber: string;
  serialNumber?: string | null;
  price: number;
  vatRateId: number | null;
}

export interface SaleDocUpdateForm {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  comment: string;
  stateId: number;
  lines: SaleDocUpdateLineForm[];
}

export interface SaleDocConfirmLineForm {
  id: number;
  amount: number;
  vatRateId: number | null;
}

export interface SaleDocConfirmForm {
  counterpartyId: number;
  docDate: string;
  lines: SaleDocConfirmLineForm[];
}

export interface SaleProductGroupForm {
  vatRateId: number | null;
  vatRateName: string;
  margin: number | null;
  salePrice: number | null;
}
