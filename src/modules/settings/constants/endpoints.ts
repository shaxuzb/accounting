export const settingsEndpoints = {
  settings: {
    list: "/settings",
    detail: (id: string | number) => `/settings/${id}`,
    create: "/settings",
    update: (id: string | number) => `/settings/${id}`,
  },
  role: {
    list: "/role",
    detail: (id: string | number) => `/role/${id}`,
    create: "/role",
    update: (id: string | number) => `/role/${id}`,
  },
  /* modux:endpoints */
};
