export const bankStatementEndpoints = {
  parser: {
    parse: "bank-statement-parser/parse",
  },
  operations: {
    list: "bank-operations",
    detail: (id: string | number) => `bank-operations/${id}`,
    create: "bank-operations",
    update: (id: string | number) => `bank-operations/${id}`,
    createMany: "bank-operations/many",
    delete: (id: string | number) => `bank-operations/${id}`,
    confirm: (id: string | number) => `bank-operations/${id}/confirm`,
    cancel: (id: string | number) => `bank-operations/${id}/cancel`,
  },
  counterpartyCards: {
    createMany: "counterparty-cards/many",
  },
} as const;
