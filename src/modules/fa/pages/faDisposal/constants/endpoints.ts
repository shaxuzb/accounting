export const endpoints = {
  list: "/fa/disposals",
  detail: (id: string | number) => `/fa/disposals/${id}`,
  update: (id: string | number) => `/fa/disposals/${id}`,
  create: "/fa/disposals",
  delete: (id: string | number) => `/fa/disposals/${id}`,
} as const;

