export const endpoints = {
    list: "counterparty-contacts",
    detail: (id: string | number) => `/counterparty-contacts/${id}`,
    create: "counterparty-contacts",
    update: (id: string | number) => `/counterparty-contacts/${id}`,
  } as const;
