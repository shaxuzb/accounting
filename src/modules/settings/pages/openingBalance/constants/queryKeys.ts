export const openingBalanceKeys = {
  all: ["opening-balances"] as const,
  current: (id?: number | null) => [...openingBalanceKeys.all, "current", id ?? null] as const,
  account: (openingBalanceId: string | number, accountId: string | number) =>
    [
      ...openingBalanceKeys.all,
      "account",
      openingBalanceId,
      accountId,
    ] as const,
} as const;
