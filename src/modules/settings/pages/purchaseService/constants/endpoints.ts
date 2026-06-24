export const endpoints = {
  list: "/purchase-services",
  detail: (id: string | number) => `/purchase-services/${id}`,
  create: "/purchase-services",
  update: (id: string | number) => `/purchase-services/${id}`,
} as const;
