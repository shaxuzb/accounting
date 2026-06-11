export const endpoints = {
    list: "product-groups",
    detail: (id: string | number) => `/product-groups/${id}`,
    create: "product-groups",
    update: (id: string | number) => `/product-groups/${id}`,
  } as const;
