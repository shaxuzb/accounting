export const cashFiscalTransferKeys = {
  all: ["cashFiscalTransfers"] as const,
  list: (params?: unknown) =>
    ["cashFiscalTransfers", "list", params] as const,
  detail: (id: string | number) =>
    ["cashFiscalTransfers", "detail", id] as const,
} as const;
