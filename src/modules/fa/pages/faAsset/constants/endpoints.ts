export const endpoints = {
  list: "fa-assets",
  detail: (id: string | number) => `/fa-assets/${id}`,
} as const;
