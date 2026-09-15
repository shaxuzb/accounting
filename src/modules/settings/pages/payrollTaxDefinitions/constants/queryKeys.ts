export const payrollTaxDefinitionKeys = {
  all: ["settings", "payrollTaxDefinitions"] as const,
  list: (params?: unknown) =>
    ["settings", "payrollTaxDefinitions", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "payrollTaxDefinitions", "detail", id] as const,
};
