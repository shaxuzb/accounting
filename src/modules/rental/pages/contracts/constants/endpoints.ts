export const rentalContractEndpoints = {
  list: "rental-contracts",
  create: "rental-contracts",
  detail: (id: string | number) => `rental-contracts/${id}`,
  update: (id: string | number) => `rental-contracts/${id}`,
  delete: (id: string | number) => `rental-contracts/${id}`,
  activate: (id: string | number, confirmationDate?: string | null) =>
    `rental-contracts/${id}/activate${confirmationDate ? `?confirmationDate=${encodeURIComponent(confirmationDate)}` : ""}`,
  cancel: (id: string | number, terminationDate?: string | null) =>
    `rental-contracts/${id}/cancel${terminationDate ? `?terminationDate=${encodeURIComponent(terminationDate)}` : ""}`,
} as const;
