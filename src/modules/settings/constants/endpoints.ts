export const settingsEndpoints = {
  settings: {
    list: "/settings",
    detail: (id: string | number) => `/settings/${id}`,
    create: "/settings",
    update: (id: string | number) => `/settings/${id}`,
  },
  /* modux:endpoints */
};
