export const endpoints = {
  list: "/fa/revaluations",
  detail: (id: string | number) => `/fa/revaluations/${id}`,
  update: (id: string | number) => `/fa/revaluations/${id}`,
  create: "/fa/revaluations",
  delete: (id: string | number) => `/fa/revaluations/${id}`,
} as const;

