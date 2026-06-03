export const authEndpoints = {
  auth: {
    list: "/auth",
    detail: (id: string | number) => `/auth/${id}`,
    create: "/auth",
    update: (id: string | number) => `/auth/${id}`,
  },
  /* modux:endpoints */
};
