export const endpoints = {
  list: "/fa-receipts",
  detail: (id: string | number) => `/fa-receipts/${id}`,
  update: (id: string | number) => `/fa-receipts/${id}`,
  create: "/fa-receipts",
  delete: (id: string | number) => `/fa-receipts/${id}`,
} as const;

