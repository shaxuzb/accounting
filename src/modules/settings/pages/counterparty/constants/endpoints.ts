export const endpoints = {
    list: "counterparty-cards",
    detail: (id: string | number) => `/counterparty-cards/${id}`,
    create: "counterparty-cards",
    update: (id: string | number) => `/counterparty-cards/${id}`,
  } as const;
