export const endpoints = {
  list: "fiscal-cash-registers",
  detail: (id: string | number) => `fiscal-cash-registers/${id}`,
  create: "fiscal-cash-registers",
  update: (id: string | number) => `fiscal-cash-registers/${id}`,
  delete: (id: string | number) => `fiscal-cash-registers/${id}`,
} as const;
