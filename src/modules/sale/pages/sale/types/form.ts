export interface SaleDocForm {
  docDate: string;
  exchangeRate?: number | null;
  counterpartyId: number | null;
  contractId: number | null;
  /** The price type the sale is priced by (1C «Тип цен»); undefined — not chosen yet. */
  priceTypeId?: number | null;
  /** The buyer's agent's power of attorney (1C «Доверенность покупателя»): the ESF's empowerment. */
  buyerEmpowermentNumber?: string | null;
  buyerEmpowermentDate?: string | null;
  buyerAgentName?: string | null;
  buyerAgentPinfl?: string | null;
  /** How the advances are offset (1C «Способ зачета аванса»): 1 automatic, 2 by document, 3 none. */
  advanceOffsetMode?: number;
  /** The advance offset when by document (a cmn_document_registry id). */
  advanceDocumentId?: number | null;
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
  /** How the advances are offset (1C «Способ зачета аванса»): 1 automatic, 2 by document, 3 none. */
  advanceOffsetMode?: number;
  /** The advance offset when by document (a cmn_document_registry id). */
  advanceDocumentId?: number | null;
  customerAccountId: number;
  /** Empty for a non-payer: «QQSsiz» posts no output VAT. */
  vatAccountId: number | null;
  docDate: string;
  exchangeRate: number;
  comment: string | null;
  processingMode: SaleProcessingMode;
  lines: SaleDocCreateLineForm[];
  /** The invoice for payment the sale is made from (1C «на основании счета»). */
  saleInvoiceId?: number | null;
  priceTypeId?: number | null;
  /** The buyer's agent's power of attorney (1C «Доверенность покупателя»): the ESF's empowerment. */
  buyerEmpowermentNumber?: string | null;
  buyerEmpowermentDate?: string | null;
  buyerAgentName?: string | null;
  buyerAgentPinfl?: string | null;
}

export interface SaleDocUpdateForm {
  docDate: string;
  exchangeRate: number;
  counterpartyId: number;
  warehouseId: number;
  currencyId: number;
  contractId: number | null;
  priceTypeId?: number | null;
  /** The buyer's agent's power of attorney (1C «Доверенность покупателя»): the ESF's empowerment. */
  buyerEmpowermentNumber?: string | null;
  buyerEmpowermentDate?: string | null;
  buyerAgentName?: string | null;
  buyerAgentPinfl?: string | null;
  /** How the advances are offset (1C «Способ зачета аванса»): 1 automatic, 2 by document, 3 none. */
  advanceOffsetMode?: number;
  /** The advance offset when by document (a cmn_document_registry id). */
  advanceDocumentId?: number | null;
  customerAccountId: number | null;
  vatAccountId: number | null;
  comment: string | null;
  lines: (SaleDocProductForm & {
    productBatches?: SaleDocCreateProductBatchForm[];
  })[];
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
  /** The discount given at the sale, percent: unitPrice and the units' prices are list prices. */
  discountPercent?: number;
  /** The rate chosen on the pricing screen; the line keeps its own when absent. */
  vatRateId?: number | null;
  /** Marked units priced one by one (unit row id and its price). */
  items?: { id: number; unitPrice: number }[];
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
  priceMode: "marginPercent" | "marginAmount" | "salePrice" | "discount";
  margin: number | null;
  marginAmount: number | null;
  salePrice: number | null;
  discount: number | null;
}
