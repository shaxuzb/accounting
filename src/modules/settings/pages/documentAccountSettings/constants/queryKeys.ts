export const queryKeys = {
  all: ["settings", "document-account-settings"] as const,
  list: ["settings", "document-account-settings", "list"] as const,
  detail: (documentTypeId: string | number) =>
    ["settings", "document-account-settings", "detail", documentTypeId] as const,
} as const;
