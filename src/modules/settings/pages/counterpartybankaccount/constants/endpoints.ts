export const endpoints = {
    list: "counterparty-bank-accounts",
    detail: (id: string | number) => `/counterparty-bank-accounts/${id}`,
    create: "counterparty-bank-accounts",
    update: (id: string | number) => `/counterparty-bank-accounts/${id}`,
  } as const;
