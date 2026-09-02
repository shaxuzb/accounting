export const paymentAcceptancePointOperationKeys = {
  all: ["paymentAcceptancePointOperations"] as const,
  list: (params?: unknown) =>
    ["paymentAcceptancePointOperations", "list", params] as const,
  detail: (id: string | number) =>
    ["paymentAcceptancePointOperations", "detail", id] as const,
  balance: (params?: unknown) =>
    ["paymentAcceptancePointOperations", "balance", params] as const,
} as const;
