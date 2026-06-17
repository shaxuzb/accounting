export const contractEndpoints = {
  contract: {
    list: "contracts",
    detail: (id: string | number) => `contracts/${id}`,
    create: "contracts",
    update: (id: string | number) => `contracts/${id}`,
  },
} as const;
