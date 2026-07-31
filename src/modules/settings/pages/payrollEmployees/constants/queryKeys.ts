export const payrollEmployeeKeys = {
  // Shared by HR employee screens and payroll employee lookup queries.
  all: ["hr", "employees"] as const,
  list: (params?: unknown) =>
    ["hr", "employees", "list", params] as const,
  detail: (id: string | number) =>
    ["hr", "employees", "detail", id] as const,
  lookup: ["hr", "employees", "lookup"] as const,
};
