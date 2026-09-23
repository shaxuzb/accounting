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
  amount?: number;
  vatAmount?: number;
  vatRateId: number | null;
  inventoryAccountId?: number;
  incomeAccountId?: number;
  costAccountId?: number;
}

export type SaleProcessingMode = 1 | 2;

export interface SaleDocCreateLineItemForm {
  productTableId: number;
}

export interface SaleDocCreateProductBatchForm {
  batchId: number;
  quantity: number;
}

export interface SaleDocCreateLineForm
  extends Omit<SaleDocProductForm, "id" | "vatAmount"> {
  assembled: true;
  items?: SaleDocCreateLineItemForm[];
  /** Units sold without a code, stated by the seller. */
  unmarkedQuantity?: number;
  productBatches?: SaleDocCreateProductBatchForm[];
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
  costPrice: number;
  unitPrice: number;
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
  /** Units the storekeeper marked as leaving without a code. */
  unmarkedQuantity?: number;
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
