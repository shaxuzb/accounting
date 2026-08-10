export const retailSaleEndpoints = {
  list: "retail-sale-docs",
  detail: (id: string | number) => `retail-sale-docs/${id}`,
  create: "retail-sale-docs",
  update: (id: string | number) => `retail-sale-docs/${id}`,
  delete: (id: string | number) => `retail-sale-docs/${id}`,
  confirm: (id: string | number) => `retail-sale-docs/${id}/confirm`,
  cancel: (id: string | number) => `retail-sale-docs/${id}/cancel`,
} as const;
