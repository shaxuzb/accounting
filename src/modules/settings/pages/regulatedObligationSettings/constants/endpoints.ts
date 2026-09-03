export const endpoints = {
  list: "regulated-obligation-settings",
  detail: (id: string | number) => `regulated-obligation-settings/${id}`,
  create: "regulated-obligation-settings",
  update: (id: string | number) => `regulated-obligation-settings/${id}`,
} as const;
