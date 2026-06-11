export const endpoints = {
    list: "org-bank-accounts",
    detail: (id: string | number) => `/org-bank-accounts/${id}`,
    create: "org-bank-accounts",
    update: (id: string | number) => `/org-bank-accounts/${id}`,
  } as const;
