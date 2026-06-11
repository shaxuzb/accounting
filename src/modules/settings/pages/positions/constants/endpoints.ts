export const endpoints = {
    list: "positions",
    detail: (id: string | number) => `/positions/${id}`,
    create: "positions",
    update: (id: string | number) => `/positions/${id}`,
  } as const;
