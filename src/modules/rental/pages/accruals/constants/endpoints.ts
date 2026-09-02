export const rentalAccrualEndpoints = {
  list: "rental-accrual-docs",
  detail: (id: string | number) => `rental-accrual-docs/${id}`,
  update: (id: string | number) => `rental-accrual-docs/${id}`,
  delete: (id: string | number) => `rental-accrual-docs/${id}`,
  generateDue: "rental-accrual-docs/generate-due",
  post: (id: string | number) => `rental-accrual-docs/${id}/post`,
  cancel: (id: string | number) => `rental-accrual-docs/${id}/cancel`,
} as const;
