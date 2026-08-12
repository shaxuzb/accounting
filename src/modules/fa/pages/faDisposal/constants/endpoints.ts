export const endpoints = {
  list: "fa-disposals",
  detail: (id: string | number) => `/fa-disposals/${id}`,
  confirm: (id: string | number) => `/fa-disposals/${id}/confirm`,
  cancel: (id: string | number) => `/fa-disposals/${id}/cancel`,
} as const;
