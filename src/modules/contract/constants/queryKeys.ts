export const contractKeys = {
  contract: {
    all: ["contracts"] as const,
    list: (params?: unknown) => ["contracts", "list", params] as const,
    detail: (id: string | number) => ["contracts", "detail", id] as const,
  },
  responsiblePerson: {
    all: ["contract-responsible-persons"] as const,
    list: (params?: unknown) =>
      ["contract-responsible-persons", "list", params] as const,
  },
} as const;
