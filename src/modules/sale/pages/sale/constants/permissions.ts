export const salePermissions = {
  view: "SALE_DOC_VIEW",
  detail: "SALE_DOC_VIEW_DETAIL",
  create: "SALE_DOC_CREATE",
  update: "SALE_DOC_UPDATE",
  delete: "SALE_DOC_DELETE",
  cancel: "CANCEL_SALE",
  /** The storekeeper's assembly (SALE_DOC_WAREHOUSE_CONFIRM on the server). */
  assembly: "SALE_DOC_WAREHOUSE_CONFIRM",
  /** Pricing and posting. */
  confirm: "CONFIRM_SALE",
} as const;
