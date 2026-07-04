import type { CashDocumentKind } from "../types/type";

export const cashDocumentKeys = {
  all: ["cashDocuments"] as const,
  list: (kind: CashDocumentKind, params?: unknown) =>
    ["cashDocuments", kind, "list", params] as const,
  detail: (kind: CashDocumentKind, id: string | number) =>
    ["cashDocuments", kind, "detail", id] as const,
} as const;
