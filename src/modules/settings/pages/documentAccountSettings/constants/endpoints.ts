export const endpoints = {
  list: "document-account-settings",
  detail: (documentTypeId: string | number) =>
    `/document-account-settings/${documentTypeId}`,
  save: "document-account-settings",
} as const;
