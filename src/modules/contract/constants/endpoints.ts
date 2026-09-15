export const contractEndpoints = {
  contract: {
    list: "contracts",
    export: "contracts/export",
    detail: (id: string | number) => `contracts/${id}`,
    create: "contracts",
    update: (id: string | number) => `contracts/${id}`,
  },
  responsiblePerson: {
    list: "contract-responsible-persons",
    detail: (id: string | number) => `contract-responsible-persons/${id}`,
    create: "contract-responsible-persons",
    update: (id: string | number) => `contract-responsible-persons/${id}`,
    delete: (id: string | number) => `contract-responsible-persons/${id}`,
  },
} as const;
