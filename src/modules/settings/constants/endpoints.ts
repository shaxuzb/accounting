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
    modules: "/manual/module-sub-groups",
    create: "/roles",
    update: (id: string | number) => `/roles/${id}`,
  },
  users: {
    list: "/users",
    detail: (id: string | number) => `/users/${id}`,
    create: "/users",
    update: (id: string | number) => `/users/${id}`,
  },
  organizations: {
    list: "/organizations",
    detail: (id: string | number) => `/organizations/${id}`,
    create: "/organizations",
    update: (id: string | number) => `/organizations/${id}`,
  },
  counterparty: {
    list: "/counterpartycard",
    detail: (id: string | number) => `/counterpartycard/${id}`,
    modules: "/manual/module-sub-groups",
    create: "/counterpartycard",
    update: (id: string | number) => `/counterpartycard/${id}`,
  },
};
