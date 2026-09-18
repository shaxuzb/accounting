/**
 * Operativ hisobotlar backendda `api/reports/<modul>` ostida turadi va har biri
 * uchta endpoint beradi: ro'yxat, bitta yozuv va eksport. Bu yerda ro'yxat va
 * eksport manzillari saqlanadi — detal sahifalari hujjat modullarining o'zida
 * ochiladi, shuning uchun `byId` bu yerda ishlatilmaydi.
 */
export const operationalReportEndpoints = {
  sales: {
    list: "/reports/sales/documents",
    export: "/reports/sales/documents/export",
  },
  purchase: {
    list: "/reports/purchase/documents",
    export: "/reports/purchase/documents/export",
  },
  warehouseTransfers: {
    list: "/reports/warehouse/transfers",
    export: "/reports/warehouse/transfers/export",
  },
  inventoryCounts: {
    list: "/reports/warehouse/counts",
    export: "/reports/warehouse/counts/export",
  },
  bank: {
    list: "/reports/bank/operations",
    export: "/reports/bank/operations/export",
  },
  cash: {
    list: "/reports/cash/operations",
    export: "/reports/cash/operations/export",
  },
  receivable: {
    list: "/reports/receivable/balances",
    export: "/reports/receivable/balances/export",
  },
  payable: {
    list: "/reports/payable/balances",
    export: "/reports/payable/balances/export",
  },
} as const;

/** Filterlardagi selectlar uchun ma'lumotnoma manzillari. */
export const reportManualEndpoints = {
  counterparties: "/manuals/counterparties",
  warehouses: "/manuals/warehouses",
  cashBoxes: "/manuals/cash-boxes",
  orgBankAccounts: "/manuals/org-bank-accounts",
} as const;

/**
 * Debitor va kreditor bitta registrda yotadi, farqi esa satrdagi
 * `settlementKindId` da (CounterpartySettlementKindConst).
 *
 * Hujjat turiga qarab ajratib bo'lmaydi: sotuv va xarid hujjatlarini ajratsa
 * ham, ularni yopadigan bank/kassa to'lovi o'z hujjat turini olib yuradi va
 * ikkala tomonga ham tegmaydi.
 */
export const counterpartySettlementKind = {
  /** Bizga qarzdor — debitor. */
  customer: 1,
  /** Biz qarzdormiz — kreditor. */
  supplier: 2,
} as const;

/** OperationTypeIdConst: qarz ortishi / qarz kamayishi. */
export const counterpartyRegisterOperationTypeId = {
  debtIncrease: 4,
  debtDecrease: 5,
} as const;
