import type { CashDocumentKind } from "../types/type";

export const cashDocumentEndpoints = {
  list: (kind: CashDocumentKind) => `cash-documents/${kind}`,
  detail: (kind: CashDocumentKind, id: string | number) =>
    `cash-documents/${kind}/${id}`,
  create: (kind: CashDocumentKind) => `cash-documents/${kind}`,
  update: (kind: CashDocumentKind, id: string | number) =>
    `cash-documents/${kind}/${id}`,
  delete: (kind: CashDocumentKind, id: string | number) =>
    `cash-documents/${kind}/${id}`,
  confirm: (kind: CashDocumentKind, id: string | number) =>
    `cash-documents/${kind}/${id}/confirm`,
  cancel: (kind: CashDocumentKind, id: string | number) =>
    `cash-documents/${kind}/${id}/cancel`,
} as const;
