export const endpoints = {
    list: "branches",
    detail: (id: string | number) => `/branches/${id}`,
    create: "branches",
    update: (id: string | number) => `/branches/${id}`,
  } as const;
