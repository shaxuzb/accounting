export const purchaseEndpoint = {
  LIST: "goods-movements",
  DETAIL: (id: number) => `goods-movements/${id}`,
  CREATE: "goods-movements",
  UPDATE: (id: number) => `goods-movements/${id}`,
  IMPORT_TEMPLATE: "goods-movements/purchase-import-template",
};

export const comeProductEndpoint = {
  LIST: "come-products",
  DETAIL: (id: number) => `come-products/${id}`,
  ACCEPT: (docId: number) => `come-products/${docId}/accept`,
};

