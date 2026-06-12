export const productEndpoints = {
  list: "product-groups",
  detail: (id: string | number) => `/product-groups/${id}`,
  create: "product-groups",
  update: (id: string | number) => `/product-groups/${id}`,
  delete: "product-groups",
  products: "products",
  changeProductType: "products/change-product-type",
  uploadProductImage: (id: string | number) => `/products/${id}/upload-image`,
  productTypeImages: (id: string | number) => `/product-types/${id}/images`,
} as const;
