export const cashBookKeys = {
  all: ["cashBook"] as const,
  cashBoxes: (params?: unknown) => ["cashBook", "cashBoxes", params] as const,
  detail: (cashBoxId: string | number, params?: unknown) =>
    ["cashBook", "detail", cashBoxId, params] as const,
} as const;
