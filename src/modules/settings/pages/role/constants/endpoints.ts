export const endpoints = {
    list: "/roles",
    detail: (id: string | number) => `/roles/${id}`,
    modules: "/manuals/module-sub-groups",
    create: "/roles",
    update: (id: string | number) => `/roles/${id}`,
  } as const;
