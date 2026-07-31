export const payrollComponentKeys = {
  all: ["settings", "payrollComponents"] as const,
  list: (params?: unknown) =>
    ["settings", "payrollComponents", "list", params] as const,
  detail: (id: string | number) =>
    ["settings", "payrollComponents", "detail", id] as const,
  lookup: ["settings", "payrollComponents", "lookup"] as const,
};
