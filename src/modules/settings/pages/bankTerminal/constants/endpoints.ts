export const endpoints = {
  list: "bank-terminals",
  detail: (id: string | number) => `bank-terminals/${id}`,
  create: "bank-terminals",
  update: (id: string | number) => `bank-terminals/${id}`,
  delete: (id: string | number) => `bank-terminals/${id}`,
} as const;
