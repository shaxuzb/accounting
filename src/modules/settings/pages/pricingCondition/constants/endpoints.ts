export const endpoints = {
  list: "pricing-conditions",
  detail: (id: string | number) => `/pricing-conditions/${id}`,
  create: "pricing-conditions",
  delete: (id: string | number) => `/pricing-conditions/${id}`,
  now: "pricing-conditions/now",
} as const;
