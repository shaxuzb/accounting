export const rentalAccrualKeys = {
  all: ["rental", "accruals"] as const,
  list: (params?: unknown) => ["rental", "accruals", "list", params] as const,
  detail: (id: string | number) =>
    ["rental", "accruals", "detail", id] as const,
} as const;
