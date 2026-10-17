import type { SelectOptionItem } from "@/components/fields/SelectCustom";

/** cmn_contract_type (1C «Вид договора»). */
export const contractTypeIds = {
  supplier: 1,
  customer: 2,
  loan: 3,
  /** with a commission agent selling our goods (its reports are sales to it) */
  commissionAgent: 4,
  /** with a committent whose goods we sell (its goods come in as a receipt) */
  committent: 5,
} as const;

/** The commission kind kept beside a document side's own: purchases a committent's, sales an agent's. */
export const commissionTwinContractType = (contractTypeId?: number | null) =>
  contractTypeId === contractTypeIds.supplier
    ? contractTypeIds.committent
    : contractTypeId === contractTypeIds.customer
      ? contractTypeIds.commissionAgent
      : undefined;

/**
 * 1C: picking the counterparty puts its main contract of the document's kind on the document,
 * or the only contract of that kind; with several and no main one the field stays empty. The
 * contract list comes with the main contract first.
 */
export const takeMainOrOnlyContract = (first: SelectOptionItem, options: SelectOptionItem[]) =>
  options.length === 1 || Boolean((first as { isDefault?: boolean }).isDefault);
