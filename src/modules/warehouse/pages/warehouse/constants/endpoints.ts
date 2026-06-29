export const endpoints = {
  groups: "/product-stocks/groups",
  products: "/product-stocks/products",
  tables: "/product-stocks/tables",
  byMarking: "/product-stocks/by-marking",
  purchases: (productId: number | string) =>
    `/product-stocks/${productId}/purchases`,
} as const;
