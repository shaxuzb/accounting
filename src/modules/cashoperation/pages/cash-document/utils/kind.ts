import type { CashDocumentKind, CashDocumentLabels } from "../types/type";

const kindLabels: Record<CashDocumentKind, CashDocumentLabels> = {
  pko: {
    kind: "pko",
    listTitle: "app.menu.incomeOrders",
    addTitle: "app.fields.cashOperationIncome",
    detailTitle: "app.fields.cashOperationIncome",
  },
  rko: {
    kind: "rko",
    listTitle: "app.menu.expenseOrders",
    addTitle: "app.fields.cashOperationExpense",
    detailTitle: "app.fields.cashOperationExpense",
  },
};

export const resolveCashDocumentKind = (
  kind?: string | null,
): CashDocumentKind => (kind === "rko" ? "rko" : "pko");

export const getCashDocumentLabels = (
  kind?: string | null,
): CashDocumentLabels => kindLabels[resolveCashDocumentKind(kind)];
