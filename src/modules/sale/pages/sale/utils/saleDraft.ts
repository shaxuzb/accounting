import type { SaleDocForm } from "../types/form";
import type { SaleScannedProduct } from "../types/type";

export interface SaleDraft {
  form: SaleDocForm;
  lines: SaleScannedProduct[];
}

const draftKey = (organizationId: number) =>
  `accounting:sale-draft:${organizationId || "default"}`;

export const getSaleDraft = (organizationId: number): SaleDraft | null => {
  try {
    const value = localStorage.getItem(draftKey(organizationId));
    return value ? (JSON.parse(value) as SaleDraft) : null;
  } catch {
    return null;
  }
};

export const saveSaleDraft = (
  organizationId: number,
  draft: SaleDraft,
) => {
  localStorage.setItem(draftKey(organizationId), JSON.stringify(draft));
};

export const clearSaleDraft = (organizationId: number) => {
  localStorage.removeItem(draftKey(organizationId));
};
