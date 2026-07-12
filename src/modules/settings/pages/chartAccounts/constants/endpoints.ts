export const endpoints = {
    list: "chart-accounts",
    detail: (id: string | number) => `/chart-accounts/${id}`,
    create: "chart-accounts",
    update: (id: string | number) => `/chart-accounts/${id}`,
    presetAccountsGrouped: "chart-account-preset-accounts",
    createFromPreset: "chart-accounts/from-preset",
  } as const;
