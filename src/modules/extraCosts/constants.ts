/** cmn_document_type of the additional costs of a purchase (1C «Поступление доп. расходов»). */
export const extraCostDocumentTypeId = 35;

export const extraCostPath = "/main/purchases/extra-costs";

export const extraCostPermissions = {
  view: "PURCHASE_EXTRA_COST_VIEW",
  create: "PURCHASE_EXTRA_COST_CREATE",
  delete: "PURCHASE_EXTRA_COST_DELETE",
  confirm: "PURCHASE_EXTRA_COST_CONFIRM",
  cancel: "PURCHASE_EXTRA_COST_CANCEL",
} as const;

export const extraCostStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

/** 1 by the goods' amount, 2 by their quantity (1C «Способ распределения»). */
export const distributionMethod = { byAmount: 1, byQuantity: 2 } as const;

/** What posting did to a batch: raised its cost, or charged the cost of sales. */
export const effectKind = { inStock: 1, sold: 2 } as const;

export const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
