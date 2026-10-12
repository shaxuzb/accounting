export const faInventoryPermissions = {
  view: "FA_INVENTORY_VIEW",
  create: "FA_INVENTORY_CREATE",
  delete: "FA_INVENTORY_DELETE",
  confirm: "FA_INVENTORY_CONFIRM",
  cancel: "FA_INVENTORY_CANCEL",
} as const;

export const faInventoryDocumentTypeId = 42;
export const faInventoryPath = "/main/fa/inventories";
export const faInventoryStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

/** The disposal and receipt types that book an inventory's result (server: FaDisposalTypeIdConst / FaReceiptTypeIdConst). */
export const faShortageDisposalTypeId = 4;
export const faSurplusReceiptTypeId = 4;
