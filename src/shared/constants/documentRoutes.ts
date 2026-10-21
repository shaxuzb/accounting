/**
 * The page of one document by its type (cmn_document_type) and id — where a journal, an
 * account card or an entry links to. A type without a page of its own (the opening balances,
 * the month close, an absence) has none: its row stays plain text.
 */
const documentPaths: Partial<Record<number, (id: number) => string>> = {
  1: (id) => `/main/purchases/purchase/${id}`,
  2: (id) => `/main/sales/sale/${id}`,
  3: (id) => `/main/bank/${id}`,
  // a cash operation opens as its PKO or RKO (the page reads which)
  4: (id) => `/main/cash-operationses/cash-operations/${id}`,
  5: (id) => `/main/payroll/documents/${id}`,
  7: (id) => `/main/sales/retail-sale/${id}`,
  8: (id) => `/main/warehouses/inventory-adjustments/${id}`,
  9: (id) => `/main/warehouses/inventory-counts/${id}`,
  11: (id) => `/main/fa/receipts/${id}`,
  12: (id) => `/main/fa/movements/${id}`,
  13: (id) => `/main/fa/depreciation/${id}`,
  14: (id) => `/main/fa/disposals/${id}`,
  15: (id) => `/main/fa/revaluations/${id}`,
  16: (id) => `/main/settings/opening-inventory/edit/${id}`,
  17: (id) => `/main/fa/commissionings/${id}`,
  18: (id) => `/main/warehouses/transfers/${id}`,
  20: (id) => `/main/payroll/timesheets/${id}`,
  21: (id) => `/main/payroll/payments/${id}`,
  23: (id) => `/main/cash-operationses/cash-fiscal-transfers/${id}`,
  24: (id) => `/main/cash-operationses/cash-collection/${id}`,
  25: (id) => `/main/cash-operationses/payment-acceptance-point-operations/${id}`,
  26: (id) => `/main/rentals/accruals/${id}`,
  27: (id) => `/main/hr/orders/${id}`,
  // a manual entry; an expense report (the same type) opens there too
  31: (id) => `/main/accountings/manual-entries/${id}`,
  32: (id) => `/main/purchases/purchase-returns/${id}`,
  33: (id) => `/main/sales/sale-returns/${id}`,
  34: (id) => `/main/sales/retail-returns/${id}`,
  35: (id) => `/main/purchases/extra-costs/${id}`,
  36: (id) => `/main/purchases/customs-declarations/${id}`,
  37: (id) => `/main/production/requisitions/${id}`,
  38: (id) => `/main/production/reports/${id}`,
  39: (id) => `/main/sales/corrections/${id}`,
  40: (id) => `/main/purchases/corrections/${id}`,
  41: (id) => `/main/fa/modernizations/${id}`,
  42: (id) => `/main/fa/inventories/${id}`,
  43: (id) => `/main/warehouses/retail-revaluations/${id}`,
  44: (id) => `/main/sales/invoices/${id}`,
  45: (id) => `/main/warehouses/price-settings/${id}`,
  46: (id) => `/main/purchases/powers-of-attorney/${id}`,
  // the editor loads any kind by id; its journal (title) is the assembly one
  48: (id) => `/main/warehouses/assemblies/${id}`,
  49: (id) => `/main/warehouses/materials-in-use/${id}`,
  50: (id) => `/main/cash-operationses/cash-documents/pko/${id}`,
  51: (id) => `/main/cash-operationses/cash-documents/rko/${id}`,
  52: (id) => `/main/rentals/contracts/${id}`,
};

/** The document's page, or null when its type has none. */
export const documentRoute = (documentTypeId: number, documentId: number): string | null =>
  documentId > 0 ? (documentPaths[documentTypeId]?.(documentId) ?? null) : null;
