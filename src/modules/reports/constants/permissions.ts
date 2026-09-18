/** PermissionCodeConst.cs dagi hisobot huquqlari bilan bir xil. */
export const operationalReportPermissions = {
  sales: {
    view: "SALES_REPORT_GET_ALL",
    export: "SALES_REPORT_EXPORT",
  },
  purchase: {
    view: "PURCHASE_REPORT_GET_ALL",
    export: "PURCHASE_REPORT_EXPORT",
  },
  warehouseTransfers: {
    view: "WAREHOUSE_REPORT_TRANSFERS",
    export: "WAREHOUSE_REPORT_EXPORT_TRANSFERS",
  },
  inventoryCounts: {
    view: "WAREHOUSE_REPORT_COUNTS",
    export: "WAREHOUSE_REPORT_EXPORT_COUNTS",
  },
  bank: {
    view: "BANK_REPORT_OPERATIONS",
    export: "BANK_REPORT_EXPORT_OPERATIONS",
  },
  cash: {
    view: "CASH_REPORT_OPERATIONS",
    export: "CASH_REPORT_EXPORT_OPERATIONS",
  },
  receivable: {
    view: "RECEIVABLE_REPORT_BALANCES",
    export: "RECEIVABLE_REPORT_EXPORT_BALANCES",
  },
  payable: {
    view: "PAYABLE_REPORT_BALANCES",
    export: "PAYABLE_REPORT_EXPORT_BALANCES",
  },
} as const;

export type OperationalReportKey = keyof typeof operationalReportPermissions;
