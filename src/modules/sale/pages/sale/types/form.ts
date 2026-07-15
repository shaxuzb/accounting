export interface SaleDocForm {
  docDate: string;
  exchangeRate?: number | null;
  counterpartyId: number | null;
  contractId: number | null;
  warehouseId: number | null;
  currencyId: number | null;
  customerAccountId: number | null;
  vatAccountId: number | null;
  comment: string;
  stateId?: number | null;
}

export interface SaleDocProductForm {
  id?: number | null;
  productId: number;
  quantity: number;
  costPrice: number;
  unitId: number;
  unitPrice: number;
  vatRateId: number | null;
  inventoryAccountId?: number;
  incomeAccountId?: number;
  costAccountId?: number;
}

export type SaleProcessingMode = 1 | 2;

export interface SaleDocCreateLineItemForm {
  productTableId: number;
}

export interface SaleDocCreateLineForm
  extends Omit<SaleDocProductForm, "id"> {
  assembled: true;
  items?: SaleDocCreateLineItemForm[];
}

export interface SaleDocCreateForm {
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  contractId: number | null;
  customerAccountId: number;
  vatAccountId: number;
  docDate: string;
  exchangeRate: number;
  comment: string | null;
  processingMode: SaleProcessingMode;
  lines: SaleDocCreateLineForm[];
}

export interface SaleDocUpdateForm {
  docDate: string;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  contractId: number | null;
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

export interface SaleDocConfirmLineItemForm {
  id: number;
  productTableId: number;
  markingNumber?: string | null;
  serialNumber?: string | null;
  costPrice: number;
  amount: number;
  vatRateId: number;
  vatAmount?: number;
  totalAmount?: number;
}

export interface SaleDocConfirmLineForm {
  id: number;
  productId: number;
  productName: string;
  productMxik?: string | null;
  isService?: boolean;
  quantity: number;
  unitId?: number | null;
  unitName?: string | null;
  costPrice: number;
  unitPrice: number;
  amount: number;
  vatRateId: number;
  vatRateName?: string | null;
  vatAmount: number;
  totalAmount: number;
  items: SaleDocConfirmLineItemForm[];
}

export interface SaleDocConfirmForm {
  lines: SaleDocConfirmLineForm[];
}

export interface SaleDocWarehouseConfirmItemForm {
  productTableId: number;
}

export interface SaleDocAssemblyLineForm {
  id: number;
  assembled: true;
  items: SaleDocWarehouseConfirmItemForm[];
}

export type SaleDocWarehouseConfirmForm = SaleDocAssemblyLineForm[];

export interface SaleProductGroupForm {
  vatRateId: number | null;
  vatRateName: string;
  priceMode: "marginPercent" | "marginAmount" | "salePrice";
  margin: number | null;
  marginAmount: number | null;
  salePrice: number | null;
}
