import type { SelectOptionItem } from "@/components/fields/SelectCustom";

/** cmn_contract_type (1C «Вид договора»). */
export const contractTypeIds = {
  supplier: 1,
  customer: 2,
  loan: 3,
} as const;

/**
 * 1C: picking the counterparty puts its main contract of the document's kind on the document,
 * or the only contract of that kind; with several and no main one the field stays empty. The
 * contract list comes with the main contract first.
 */
export const takeMainOrOnlyContract = (first: SelectOptionItem, options: SelectOptionItem[]) =>
  options.length === 1 || Boolean((first as { isDefault?: boolean }).isDefault);
