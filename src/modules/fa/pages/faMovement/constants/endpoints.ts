export const endpoints = {
  list: "/fa-movements",
  detail: (id: string | number) => `/fa-movements/${id}`,
  update: (id: string | number) => `/fa-movements/${id}`,
  create: "/fa-movements",
  delete: (id: string | number) => `/fa-movements/${id}`,
} as const;

