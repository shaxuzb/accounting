import type { CashDocumentKind, CashDocumentLabels } from "../types/type";

const kindLabels: Record<CashDocumentKind, CashDocumentLabels> = {
  pko: {
    kind: "pko",
    listTitle: "Kirim orderlari",
    addTitle: "Yangi kirim orderi",
    detailTitle: "Kirim orderi",
  },
  rko: {
    kind: "rko",
    listTitle: "Chiqim orderlari",
    addTitle: "Yangi chiqim orderi",
    detailTitle: "Chiqim orderi",
  },
};

export const resolveCashDocumentKind = (
  kind?: string | null,
): CashDocumentKind => (kind === "rko" ? "rko" : "pko");

export const getCashDocumentLabels = (
  kind?: string | null,
): CashDocumentLabels => kindLabels[resolveCashDocumentKind(kind)];
