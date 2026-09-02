export const cashCollectionKeys = {
  all: ["cashCollection"] as const,
  list: (params?: unknown) => ["cashCollection", "list", params] as const,
  detail: (id: string | number) =>
    ["cashCollection", "detail", id] as const,
  inTransit: (params?: unknown) =>
    ["cashCollection", "inTransit", params] as const,
} as const;
