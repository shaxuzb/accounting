export const payrollPeriodKeys = {
  all: ["payroll", "periods"] as const,
  list: (params?: unknown) => ["payroll", "periods", "list", params] as const,
  detail: (id: string | number) =>
    ["payroll", "periods", "detail", id] as const,
  lookup: (status?: string) => ["payroll", "periods", "lookup", status] as const,
};
