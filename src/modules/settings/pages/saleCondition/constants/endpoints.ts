export const endpoints = {
  list: "sale-conditions",
  detail: (id: string | number) => `/sale-conditions/${id}`,
  create: "sale-conditions",
  delete: (id: string | number) => `/sale-conditions/${id}`,
  now: "sale-conditions/now",
} as const;
