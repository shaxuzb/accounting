export const payrollEmployeeKeys = {
  all: ["settings", "payrollEmployees"] as const,
  list: (params?: unknown) =>
    ["settings", "payrollEmployees", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "payrollEmployees", "detail", id] as const,
};
