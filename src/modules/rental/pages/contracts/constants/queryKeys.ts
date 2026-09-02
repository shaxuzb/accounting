export const rentalContractKeys = {
  all: ["rental", "contracts"] as const,
  list: (params?: unknown) => ["rental", "contracts", "list", params] as const,
  detail: (id: string | number) =>
    ["rental", "contracts", "detail", id] as const,
} as const;
