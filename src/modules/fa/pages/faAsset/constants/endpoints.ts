export const endpoints = {
  list: "fa-assets",
  detail: (id: string | number) => `/fa-assets/${id}`,
  update: (id: string | number) => `/fa-assets/${id}`,
  create: "fa-assets",
  delete: (id: string | number) => `/fa-assets/${id}`,
} as const;
