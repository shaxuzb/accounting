export const openingBalanceEndpoints = {
  current: "opening-balances",
  create: "opening-balances",
  update: (id: string | number) => `opening-balances/${id}`,
  delete: (id: string | number) => `opening-balances/${id}`,
  accountDetail: (
    openingBalanceId: string | number,
    accountId: string | number,
  ) => `opening-balances/${openingBalanceId}/accounts/${accountId}`,
  saveAccount: (openingBalanceId: string | number) =>
    `opening-balances/${openingBalanceId}/accounts`,
} as const;
