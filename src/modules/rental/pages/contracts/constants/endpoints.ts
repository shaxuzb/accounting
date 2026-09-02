export const rentalContractEndpoints = {
  list: "rental-contracts",
  create: "rental-contracts",
  detail: (id: string | number) => `rental-contracts/${id}`,
  update: (id: string | number) => `rental-contracts/${id}`,
  delete: (id: string | number) => `rental-contracts/${id}`,
  activate: (id: string | number) => `rental-contracts/${id}/activate`,
  cancel: (id: string | number) => `rental-contracts/${id}/cancel`,
} as const;
