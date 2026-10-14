export const endpoints = {
  list: "fa/depreciation/run",
  detail: (id: string | number) => `/fa/depreciation/run/${id}`,
  cancel: (id: string | number) => `/fa/depreciation/run/${id}/cancel`,
  output: "/fa/depreciation/output",
} as const;
