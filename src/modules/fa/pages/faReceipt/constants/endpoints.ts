export const endpoints = {
  list: "fa-receipts",
  detail: (id: string | number) => `/fa-receipts/${id}`,
  confirm: (id: string | number) => `/fa-receipts/${id}/confirm`,
  cancel: (id: string | number) => `/fa-receipts/${id}/cancel`,
} as const;
