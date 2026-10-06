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
  deleteAccount: (
    openingBalanceId: string | number,
    accountId: string | number,
  ) => `opening-balances/${openingBalanceId}/accounts/${accountId}`,
  post: (id: string | number) => `opening-balances/${id}/post`,
  unpost: (id: string | number) => `opening-balances/${id}/unpost`,
  closeOffset: (id: string | number) => `opening-balances/${id}/close-offset`,
} as const;
