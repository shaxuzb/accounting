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
    users: {
      list: "/users",
      detail: (id: string | number) => `/users/${id}`,
      create: "/users",
      update: (id: string | number) => `/users/${id}`,
    },
    /* modux:endpoints */
  },
};
