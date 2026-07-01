export const postingTemplateViewsKeys = {
  list: (params?: unknown) => ["postingTemplateViews", "list", params] as const,
  detail: (id: string | number) => ["postingTemplateViews", "detail", id] as const,
} as const;
