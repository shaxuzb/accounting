export const queryKeys = {
  all: ["payment-acceptance-points"] as const,
  list: (params?: unknown) =>
    ["payment-acceptance-points", "list", params] as const,
  detail: (id: string | number) =>
    ["payment-acceptance-points", "detail", id] as const,
};
