export const endpoints = {
    list: "warehouses",
    detail: (id: string | number) => `/warehouses/${id}`,
    create: "warehouses",
    update: (id: string | number) => `/warehouses/${id}`,
  } as const;
