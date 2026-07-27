export const openingBalanceKeys = {
  all: ["opening-balances"] as const,
  current: () => [...openingBalanceKeys.all, "current"] as const,
  account: (openingBalanceId: string | number, accountId: string | number) =>
    [
      ...openingBalanceKeys.all,
      "account",
      openingBalanceId,
      accountId,
    ] as const,
} as const;
