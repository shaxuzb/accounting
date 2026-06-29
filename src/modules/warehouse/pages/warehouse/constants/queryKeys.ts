export const queryKeys = {
  all: ["product-stocks"] as const,
  groups: (params?: unknown) =>
    ["product-stocks", "groups", params] as const,
  products: (params?: unknown) =>
    ["product-stocks", "products", params] as const,
  tables: (params?: unknown) =>
    ["product-stocks", "tables", params] as const,
};
