export const currencyEndpoints = {
  rates: "/currency-rates",
  rateOnDate: "/currency-rates/on-date",
  importByDate: "/currency-rates/import/date",
  revaluations: "/currency-revaluations",
  revaluationPreview: "/currency-revaluations/preview",
  revaluationConfirm: (id: number) => `/currency-revaluations/${id}/confirm`,
  revaluationCancel: (id: number) => `/currency-revaluations/${id}/cancel`,
} as const;

export const currencyRatePermissions = {
  view: "CURRENCY_RATE_VIEW",
  sync: "CURRENCY_RATE_SYNC",
} as const;

export const currencyRevaluationPermissions = {
  view: "CURRENCY_REVALUATION_VIEW",
  create: "CURRENCY_REVALUATION_CREATE",
  confirm: "CURRENCY_REVALUATION_CONFIRM",
  cancel: "CURRENCY_REVALUATION_CANCEL",
} as const;

export const currencyKeys = {
  rates: (params: object) => ["currency-rates", params] as const,
  rateOnDate: (currencyId: number, date: string) =>
    ["currency-rate-on-date", currencyId, date] as const,
  revaluations: (params: object) => ["currency-revaluations", params] as const,
  revaluation: (id: number) => ["currency-revaluation", id] as const,
  allRevaluations: ["currency-revaluations"] as const,
} as const;

/** acc document status ids (DocumentStatusIdConst). */
export const revaluationStatus = { draft: 1, posted: 2, cancelled: 3 } as const;

export const UZS_CURRENCY_ID = 1;
