export const endpoints = {
    list: "cash-boxes",
    detail: (id: string | number) => `/cash-boxes/${id}`,
    create: "cash-boxes",
    update: (id: string | number) => `/cash-boxes/${id}`,
  } as const;
