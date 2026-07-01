import type { SaleDocForm } from "../types/form";
import type { SaleSelectedProduct } from "../types/type";

export interface SaleDraft {
  form: SaleDocForm;
  products: SaleSelectedProduct[];
  saleConditionKey?: string;
}

const draftKey = (organizationId: number) =>
  `accounting:sale-draft:${organizationId || "default"}`;

export const getSaleConditionDraftKey = (saleCondition?: {
  id?: number | null;
  costingMethodId?: number | null;
  vatRateId?: number | null;
}) =>
  saleCondition
    ? [
        saleCondition.id ?? "none",
        saleCondition.costingMethodId ?? "none",
        saleCondition.vatRateId ?? "none",
      ].join(":")
    : "";

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
