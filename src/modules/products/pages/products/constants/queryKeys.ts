export const productKeys = {
  all: ["products"] as const,
  list: (params?: unknown) => ["products", "list", params] as const,
  detail: (id: string | number) => ["products", "detail", id] as const,
  images: (id: string | number) => ["products", "images", id] as const,
} as const;
