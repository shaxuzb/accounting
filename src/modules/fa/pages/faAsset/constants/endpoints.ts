export const endpoints = {
  list: "fa-assets",
  detail: (id: string | number) => `/fa-assets/${id}`,
  confirm: (id: string | number) => `/fa-assets/${id}/confirm`,
  cancel: (id: string | number) => `/fa-assets/${id}/cancel`,
} as const;
