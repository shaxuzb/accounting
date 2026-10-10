/** The correction of a posted sale (1C «Корректировка реализации») or purchase («… поступления»). */
export type CorrectionKind = "sale" | "purchase";

export const corrections = {
  sale: { kind: 1, documentTypeId: 39, path: "/main/sales/corrections", titleKey: "correction.sale.title", newKey: "correction.sale.new" },
  purchase: { kind: 2, documentTypeId: 40, path: "/main/purchases/corrections", titleKey: "correction.purchase.title", newKey: "correction.purchase.new" },
} as const;

export const correctionPermissions = {
  view: "CORRECTION_DOC_VIEW",
  create: "CORRECTION_DOC_CREATE",
  delete: "CORRECTION_DOC_DELETE",
  confirm: "CORRECTION_DOC_CONFIRM",
  cancel: "CORRECTION_DOC_CANCEL",
} as const;

export const correctionStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

/** A sale's reason: 1 the price agreed again (revenue), 2 a discount after the sale (9050). */
export const correctionReason = { price: 1, discount: 2 } as const;

export const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
