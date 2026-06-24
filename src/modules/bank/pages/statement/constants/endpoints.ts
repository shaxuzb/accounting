export const bankStatementEndpoints = {
  parser: {
    parse: "bank-statement-parser/parse",
  },
  operations: {
    list: "bank-operations",
    createMany: "bank-operations/many",
    delete: (id: string | number) => `bank-operations/${id}`,
  },
} as const;
