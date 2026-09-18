/**
 * Hisobot endpointlari `PagedResponse<T>` ni o'zgartirmasdan qaytaradi, shuning
 * uchun maydon nomlari backenddagi bilan bir xil (`totalCount`, `hasNextPage`).
 */
export interface ReportPagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** SaleDocListDto */
export interface SalesReportRow {
  id: number;
  docNumber: string;
  docDate: string;
  counterpartyName: string;
  warehouseName: string;
  currencyCode?: string | null;
  currencyName?: string | null;
  totalAmount: number;
  finalAmount: number;
  statusId: number;
  statusName: string;
  contractNumber?: string | null;
}

/** PurchaseDocListDto */
export interface PurchaseReportRow {
  id: number;
  docNumber: string;
  externalDocNumber?: string | null;
  docDate: string;
  counterpartyName: string;
  warehouseName: string;
  currencyName?: string | null;
  totalAmount: number;
  finalAmount: number;
  statusId: number;
  statusName: string;
  contractNumber?: string | null;
}

/** WarehouseTransferListDto */
export interface WarehouseTransferReportRow {
  id: number;
  docNumber: string;
  docDate: string;
  sourceWarehouseName: string;
  destinationWarehouseName: string;
  statusId: number;
  statusName: string;
  comment?: string | null;
}

/** InventoryCountListDto */
export interface InventoryCountReportRow {
  id: number;
  docNumber: string;
  docDate: string;
  warehouseName: string;
  statusId: number;
  statusName: string;
  countCompletedAt?: string | null;
  postedAt?: string | null;
}

/** BankOperationListDto */
export interface BankOperationReportRow {
  id: number;
  docNumber: string;
  bankDocumentNumber?: string | null;
  docDate: string;
  bankName: string;
  bankAccountNumber: string;
  directionId: number;
  directionName: string;
  counterpartyName?: string | null;
  offsetAccountNumber?: string | null;
  amount: number;
  currencyName?: string | null;
  statusId: number;
  statusName: string;
  comment?: string | null;
}

/** CashOperationListDto */
export interface CashOperationReportRow {
  id: number;
  docNumber: string;
  docDate: string;
  cashBoxName: string;
  operationTypeId: number;
  operationTypeName: string;
  counterpartyName?: string | null;
  offsetAccountNumber?: string | null;
  amount: number;
  currencyName?: string | null;
  statusId: number;
  statusName: string;
  comment?: string | null;
}

/**
 * CounterpartyRegisterBalanceListDto. Registr faqat `counterpartyId` beradi —
 * nomi `/manuals/counterparties` ma'lumotnomasidan qo'shiladi.
 */
export interface CounterpartyBalanceReportRow {
  id: number;
  documentTypeId: number;
  documentId: number;
  counterpartyId: number;
  operationTypeId: number;
  currencyId: number;
  amount: number;
  docDate: string;
}

/** Kontragent kesimida yig'ilgan qarz. */
export interface CounterpartyBalanceSummary {
  counterpartyId: number;
  counterpartyName: string;
  increase: number;
  decrease: number;
  balance: number;
  movements: number;
  lastDocDate: string | null;
}

export interface ManualSelectItem {
  id: number;
  name: string;
  code?: string | null;
}
