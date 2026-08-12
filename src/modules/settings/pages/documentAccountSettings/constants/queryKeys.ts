export const queryKeys = {
  all: ["settings", "document-account-settings"] as const,
  list: ["settings", "document-account-settings", "list"] as const,
  detail: (documentTypeId: string | number, organizationId?: number | null) =>
    [
      "settings",
      "document-account-settings",
      "detail",
      documentTypeId,
      organizationId ?? null,
    ] as const,
} as const;
