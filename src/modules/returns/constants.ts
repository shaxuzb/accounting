/** ret_doc.kind: what a return gives back (ReturnKindConst on the server). */
export const returnKind = {
  toSupplier: 1,
  fromCustomer: 2,
  fromRetail: 3,
} as const;
export type ReturnKind = (typeof returnKind)[keyof typeof returnKind];

/** cmn_document_type of each kind: 31 + kind. */
export const returnDocumentTypeId = (kind: ReturnKind) => 31 + kind;

export const returnPaths: Record<ReturnKind, string> = {
  [returnKind.toSupplier]: "/main/purchases/purchase-returns",
  [returnKind.fromCustomer]: "/main/sales/sale-returns",
  [returnKind.fromRetail]: "/main/sales/retail-returns",
};

/** Locale key of each kind's title. */
export const returnTitleKeys: Record<ReturnKind, string> = {
  [returnKind.toSupplier]: "returnDoc.kinds.toSupplier",
  [returnKind.fromCustomer]: "returnDoc.kinds.fromCustomer",
  [returnKind.fromRetail]: "returnDoc.kinds.fromRetail",
};

export const returnPermissions = {
  view: "RETURN_DOC_VIEW",
  create: "RETURN_DOC_CREATE",
  delete: "RETURN_DOC_DELETE",
  confirm: "RETURN_DOC_CONFIRM",
  cancel: "RETURN_DOC_CANCEL",
} as const;

export const returnStatus = { draft: 1, posted: 2, cancelled: 3 } as const;
