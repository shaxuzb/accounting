export const faModernizationPermissions = {
  view: "FA_MODERNIZATION_VIEW",
  create: "FA_MODERNIZATION_CREATE",
  delete: "FA_MODERNIZATION_DELETE",
  confirm: "FA_MODERNIZATION_CONFIRM",
  cancel: "FA_MODERNIZATION_CANCEL",
} as const;

export const faModernizationDocumentTypeId = 41;
export const faModernizationPath = "/main/fa/modernizations";
export const faModernizationStatus = { draft: 1, posted: 2, cancelled: 3 } as const;
