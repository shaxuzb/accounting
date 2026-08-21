/** 1 — faqat saqlash, 2 — saqlash va tasdiqlash. */
export type RetailSaleProcessingMode = 1 | 2;

export interface RetailSalePaymentForm {
  id?: number;
  paymentMethodId: number | null;
  bankTerminalId: number | null;
  debitAccountId: number | null;
  amount: number | null;
  transactionNumber: string;
}

export interface RetailSaleFormValues {
  docDate: string;
  counterpartyId: number | null;
  warehouseId: number | null;
  cashRegisterId: number | null;
  currencyId: number | null;
  exchangeRate: number;
  receivableAccountId: number | null;
  vatAccountId: number | null;
  comment: string;
  stateId: number;
  payments: RetailSalePaymentForm[];
}

export interface RetailSaleLinePayload {
  productId: number;
  quantity: number;
  unitId: number;
  unitPrice: number;
  costPrice: number;
  amount: number;
  vatAmount: number;
  vatRateId: number | null;
  inventoryAccountId: number | null;
  incomeAccountId: number | null;
  costAccountId: number | null;
  items?: Array<{ productTableId: number }>;
}

export interface RetailSalePaymentPayload {
  paymentMethodId: number;
  bankTerminalId: number | null;
  debitAccountId: number;
  amount: number;
  transactionNumber: string | null;
}

export interface RetailSaleCreatePayload {
  docDate: string;
  counterpartyId: number | null;
  warehouseId: number;
  cashRegisterId: number;
  currencyId: number;
  exchangeRate: number;
  receivableAccountId: number | null;
  vatAccountId: number | null;
  comment: string | null;
  processingMode: RetailSaleProcessingMode;
  lines: RetailSaleLinePayload[];
  payments: RetailSalePaymentPayload[];
}

export interface RetailSaleUpdatePayload
  extends Omit<RetailSaleCreatePayload, "processingMode"> {
  stateId: number;
}

export interface RetailSaleConfirmPayload {
  lines: Array<{
    id: number;
    unitPrice: number;
    costPrice: number;
  }>;
  payments: RetailSalePaymentPayload[];
}
