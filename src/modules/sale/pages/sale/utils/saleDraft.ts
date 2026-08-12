import type { SaleDocForm, SaleProcessingMode } from "../types/form";
import type { SaleSelectedProduct } from "../types/type";

export interface SaleDraft {
  form: SaleDocForm;
  products: SaleSelectedProduct[];
  processingMode?: SaleProcessingMode;
  saleConditionKey?: string;
}

const getUserId = () => {
  try {
    const raw = localStorage.getItem("login");
    const parsed = raw ? (JSON.parse(raw) as { user?: { id?: number } }) : null;
    return parsed?.user?.id || "anonymous";
  } catch {
    return "anonymous";
  }
};

const draftKey = (organizationId: number) =>
  `accounting:form-draft:${getUserId()}:${organizationId || "default"}:sale`;

const legacyDraftKey = (organizationId: number) =>
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
    const value =
      localStorage.getItem(draftKey(organizationId)) ??
      localStorage.getItem(legacyDraftKey(organizationId));
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
  localStorage.removeItem(legacyDraftKey(organizationId));
};
