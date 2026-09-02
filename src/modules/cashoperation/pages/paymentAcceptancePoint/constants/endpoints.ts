export const endpoints = {
  list: "payment-acceptance-points",
  detail: (id: string | number) => `payment-acceptance-points/${id}`,
  create: "payment-acceptance-points",
  update: (id: string | number) => `payment-acceptance-points/${id}`,
  delete: (id: string | number) => `payment-acceptance-points/${id}`,
} as const;
