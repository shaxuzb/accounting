export const endpoints = {
  list: "/banks",
  detail: (id: string | number) => `/banks/${id}`,
  create: "/banks",
  update: (id: string | number) => `/banks/${id}`,
} as const;
