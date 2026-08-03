export const endpoints = {
  list: "fa-movements",
  detail: (id: string | number) => `/fa-movements/${id}`,
  confirm: (id: string | number) => `/fa-movements/${id}/confirm`,
  cancel: (id: string | number) => `/fa-movements/${id}/cancel`,
} as const;
