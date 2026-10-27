import { documentRoute } from "@/shared/constants/documentRoutes";

/**
 * The table each document type is kept in (the tables whose rows the document registry follows):
 * a document's history is read by its table and id.
 */
export const documentTypeTables: Record<number, string> = {
  1: "pur_doc",
  2: "sale_doc",
  3: "bank_operation",
  4: "cash_operation",
  5: "pay_payroll_doc",
  7: "rtl_sale_doc",
  8: "inv_inventory_adjustment_doc",
  9: "inv_inventory_count_doc",
  10: "cmn_currency_revaluation",
  11: "fa_receipt_doc",
  12: "fa_movement_doc",
  13: "fa_depreciation_run",
  14: "fa_disposal_doc",
  15: "fa_revaluation_doc",
  16: "inv_opening_inventory",
  17: "fa_commissioning_doc",
  18: "inv_transfer_doc",
  19: "sale_shipment_doc",
  20: "pay_timesheet",
  21: "pay_payment_batch",
  22: "hr_absence",
  23: "cash_fiscal_transfer_doc",
  24: "cash_collection_doc",
  25: "payment_acceptance_point_operation",
  26: "rnt_accrual_doc",
  27: "pay_hr_order",
  31: "acc_manual_entry",
  32: "ret_doc",
  33: "ret_doc",
  34: "ret_doc",
  35: "pur_extra_cost_doc",
  36: "pur_customs_doc",
  37: "inv_material_requisition_doc",
  38: "inv_production_report_doc",
  39: "ret_correction_doc",
  40: "ret_correction_doc",
  41: "fa_modernization_doc",
  42: "fa_inventory_doc",
  43: "rtl_revaluation_doc",
  44: "sale_invoice_doc",
  45: "inv_price_setting_doc",
  46: "pur_power_of_attorney_doc",
  47: "sale_commission_report_doc",
  48: "inv_conversion_doc",
  49: "inv_materials_in_use_doc",
  50: "cash_operation",
  51: "cash_operation",
  52: "rnt_contract",
};

const placeholder = 987654321;

/** Each document page as a pattern: its view address, and its editor's (…/edit/:id). */
const documentPatterns = Object.entries(documentTypeTables).flatMap(([type, table]) => {
  const sample = documentRoute(Number(type), placeholder);
  if (!sample) return [];
  const [before] = sample.split(String(placeholder));
  const escaped = before.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [
    { table, documentTypeId: Number(type), pattern: new RegExp(`^${escaped}(\\d+)(?:/|$)`) },
    { table, documentTypeId: Number(type), pattern: new RegExp(`^${escaped}edit/(\\d+)(?:/|$)`) },
  ];
});

/** The document the page shows, read from its address; null on a page of no one document. */
export const recordFromPath = (pathname: string) => {
  for (const { table, documentTypeId, pattern } of documentPatterns) {
    const match = pattern.exec(pathname);
    if (match) return { table, id: match[1], documentTypeId };
  }
  return null;
};

/** The page of a document by its table, for a link from the journal; null when it has none. */
export const routeForTable = (table: string | null | undefined, id: string | null | undefined) => {
  if (!table || !id || !/^\d+$/.test(id)) return null;
  const type = Object.entries(documentTypeTables).find(([, t]) => t === table)?.[0];
  return type ? documentRoute(Number(type), Number(id)) : null;
};
