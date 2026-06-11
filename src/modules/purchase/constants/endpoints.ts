export const purchaseEndpoints = {
  purchase: {
    list: "/purchase",
    detail: (id: string | number) => `/purchase/${id}`,
    create: "/purchase",
    update: (id: string | number) => `/purchase/${id}`,
  },
  /* modux:endpoints */
};
