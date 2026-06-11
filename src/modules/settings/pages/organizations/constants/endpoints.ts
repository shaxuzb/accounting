export const endpoints = {
    list: "/organizations",
    detail: (id: string | number) => `/organizations/${id}`,
    create: "/organizations",
    update: (id: string | number) => `/organizations/${id}`,
  } as const;
