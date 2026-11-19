export const endpoints = {
  /** The common directory: the Central Bank's register. */
  directory: "/banks",
  /** The organization's banks: picked from the directory or used by its bank accounts. */
  mine: "/banks/mine",
  detach: (bankId: number) => `/banks/mine/${bankId}`,
} as const;
