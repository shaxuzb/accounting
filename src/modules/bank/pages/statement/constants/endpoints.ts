export const bankStatementEndpoints = {
  parser: {
    parse: "bank-statement-parser/parse",
  },
  operations: {
    list: "bank-operations",
    create: "bank-operations",
    update: (id: string | number) => `bank-operations/${id}`,
    createMany: "bank-operations/many",
    delete: (id: string | number) => `bank-operations/${id}`,
  },
} as const;
