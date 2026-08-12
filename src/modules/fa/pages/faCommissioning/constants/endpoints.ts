export const endpoints = {
  list: "fa-commissionings",
  detail: (id: string | number) => `/fa-commissionings/${id}`,
  confirm: (id: string | number) => `/fa-commissionings/${id}/confirm`,
  cancel: (id: string | number) => `/fa-commissionings/${id}/cancel`,
} as const;
