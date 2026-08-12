export const endpoints = {
  list: "fa-revaluations",
  detail: (id: string | number) => `/fa-revaluations/${id}`,
  confirm: (id: string | number) => `/fa-revaluations/${id}/confirm`,
  cancel: (id: string | number) => `/fa-revaluations/${id}/cancel`,
} as const;
