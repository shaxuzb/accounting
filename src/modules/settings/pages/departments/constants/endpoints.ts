export const endpoints = {
    list: "departments",
    detail: (id: string | number) => `/departments/${id}`,
    create: "departments",
    update: (id: string | number) => `/departments/${id}`,
  } as const;
