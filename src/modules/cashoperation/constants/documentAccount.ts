export const cashDocumentTypeIds = {
  income: 7,
  expense: 8,
} as const;

export const cashDocumentAccountRoleCodes = {
  cashAccount: "cash_account",
  offsetAccount: "offset_account",
} as const;

export const getCashDocumentTypeId = (operationTypeId: unknown) =>
  Number(operationTypeId) === 1
    ? cashDocumentTypeIds.income
    : Number(operationTypeId) === 2
      ? cashDocumentTypeIds.expense
      : null;
