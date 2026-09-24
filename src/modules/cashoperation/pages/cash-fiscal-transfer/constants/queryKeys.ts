export const cashFiscalTransferKeys = {
  all: ["cashFiscalTransfers"] as const,
  list: (params?: unknown) =>
    ["cashFiscalTransfers", "list", params] as const,
  detail: (id: string | number) =>
    ["cashFiscalTransfers", "detail", id] as const,
  fiscalBalance: (params: unknown) =>
    ["cashFiscalTransfers", "fiscalBalance", params] as const,
} as const;
