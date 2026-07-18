import type { CashDocumentKind, CashDocumentLabels } from "../types/type";

const kindLabels: Record<CashDocumentKind, CashDocumentLabels> = {
  pko: {
    kind: "pko",
    listTitle: "app.menu.incomeOrders",
    addTitle: "app.routes.newIncomeOrder",
    detailTitle: "app.routes.incomeOrder",
  },
  rko: {
    kind: "rko",
    listTitle: "app.menu.expenseOrders",
    addTitle: "app.routes.newExpenseOrder",
    detailTitle: "app.routes.expenseOrder",
  },
};

export const resolveCashDocumentKind = (
  kind?: string | null,
): CashDocumentKind => (kind === "rko" ? "rko" : "pko");

export const getCashDocumentLabels = (
  kind?: string | null,
): CashDocumentLabels => kindLabels[resolveCashDocumentKind(kind)];
