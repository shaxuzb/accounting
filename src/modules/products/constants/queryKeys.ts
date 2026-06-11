export const productsKeys = {
  products: {
    all: ["products", "products"] as const,
    list: (params?: unknown) => ["products", "products", "list", params] as const,
    detail: (id: string | number) => ["products", "products", "detail", id] as const,
  },
  /* modux:querykeys */
};
