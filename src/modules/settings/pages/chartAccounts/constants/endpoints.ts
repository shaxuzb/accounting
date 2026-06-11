export const endpoints = {
    list: "chart-accounts",
    detail: (id: string | number) => `/chart-accounts/${id}`,
    create: "chart-accounts",
    update: (id: string | number) => `/chart-accounts/${id}`,
  } as const;
