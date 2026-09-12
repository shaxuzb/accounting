export const hrOrderKeys = {
  all: ["hr", "orders"] as const,
  lists: () => [...hrOrderKeys.all, "list"] as const,
  list: (params?: unknown) => [...hrOrderKeys.lists(), params] as const,
  details: () => [...hrOrderKeys.all, "detail"] as const,
  detail: (id: string | number) => [...hrOrderKeys.details(), String(id)] as const,
  print: (id: string | number) => [...hrOrderKeys.all, "print", String(id)] as const,
};
