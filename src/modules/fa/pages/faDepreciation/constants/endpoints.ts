export const endpoints = {
  list: "/fa/depreciation/run",
  detail: (id: string | number) => `/fa/depreciation/run/${id}`,
  update: (id: string | number) => `/fa/depreciation/run/${id}`,
  create: "/fa/depreciation/run",
  delete: (id: string | number) => `/fa/depreciation/run/${id}`,
} as const;

