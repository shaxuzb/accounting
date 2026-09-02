export const documentEndpoints = {
  list: "documents",
  detail: (id: string | number) => `documents/${id}`,
} as const;
