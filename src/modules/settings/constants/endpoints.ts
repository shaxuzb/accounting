export const settingsEndpoints = {
  settings: {
    list: "/settings",
    detail: (id: string | number) => `/settings/${id}`,
    create: "/settings",
    update: (id: string | number) => `/settings/${id}`,
  },
  role: {
    list: "/roles",
    detail: (id: string | number) => `/roles/${id}`,
    create: "/roles",
    update: (id: string | number) => `/roles/${id}`,
  },
  users: {
    list: "/users",
    detail: (id: string | number) => `/users/${id}`,
    create: "/users",
    update: (id: string | number) => `/users/${id}`,
  },
};
