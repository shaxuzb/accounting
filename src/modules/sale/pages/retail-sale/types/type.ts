import type {
  SaleDoc,
  SaleDocProduct,
  SaleDocTable,
} from "../../sale/types/type";

export interface RetailSalePayment {
  id?: number;
  paymentMethodId: number;
  paymentMethodName?: string | null;
  bankTerminalId: number | null;
  bankTerminalName?: string | null;
  debitAccountId: number;
  debitAccountName?: string | null;
  amount: number;
  transactionNumber: string | null;
}

export interface RetailSaleDoc
  extends Omit<SaleDoc, "counterpartyId" | "products" | "lines"> {
  counterpartyId: number | null;
  cashRegisterId: number;
  cashRegisterName?: string | null;
  exchangeRate: number;
  receivableAccountId: number | null;
  receivableAccountName?: string | null;
  products?: SaleDocProduct[];
  lines?: SaleDocTable[];
  payments?: RetailSalePayment[];
}
