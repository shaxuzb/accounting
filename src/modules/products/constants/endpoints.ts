export const productsEndpoints = {
  products: {
    list: "/products",
    detail: (id: string | number) => `/products/${id}`,
    create: "/products",
    update: (id: string | number) => `/products/${id}`,
  },
  /* modux:endpoints */
};
