export const postingTemplateViewsEndpoints = {
  list: "posting-template-views",
  detail: (id: string | number) => `posting-template-views/${id}`,
} as const;
