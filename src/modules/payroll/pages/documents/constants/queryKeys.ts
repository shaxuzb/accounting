export const payrollDocumentKeys = {
  all: ["payroll", "documents"] as const,
  list: (params?: unknown) => ["payroll", "documents", "list", params] as const,
  detail: (id: string | number) =>
    ["payroll", "documents", "detail", id] as const,
  lookup: (periodId?: number | null) =>
    ["payroll", "documents", "lookup", periodId ?? "all"] as const,
};
