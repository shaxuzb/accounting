/** cmn_document_type of a customs declaration of an import (1C «Таможенная декларация (импорт)»). */
export const customsDocumentTypeId = 36;

export const customsPath = "/main/purchases/customs-declarations";

export const customsPermissions = {
  view: "CUSTOMS_DECLARATION_VIEW",
  create: "CUSTOMS_DECLARATION_CREATE",
  delete: "CUSTOMS_DECLARATION_DELETE",
  confirm: "CUSTOMS_DECLARATION_CONFIRM",
  cancel: "CUSTOMS_DECLARATION_CANCEL",
} as const;

export const customsStatus = { draft: 1, posted: 2, cancelled: 3 } as const;
