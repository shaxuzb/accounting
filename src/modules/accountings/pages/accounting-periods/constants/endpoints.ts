export const accountingPeriodsEndpoints = {
  close: (id: number | string) => `/accounting-periods/${id}/close`,
  reopen: (id: number | string) => `/accounting-periods/${id}/reopen`,
} as const;
