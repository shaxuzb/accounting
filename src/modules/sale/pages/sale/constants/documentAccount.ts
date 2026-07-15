export const saleDocumentTypeId = 3;

export const saleDocumentAccountRoleCodes = {
  customerSettlement: "customer_settlement",
  income: "sale_income",
  vat: "sale_vat",
  cost: "sale_cost",
  inventory: "sale_inventory",
} as const;

export const saleDocumentAccountChartAccountsPath = () =>
  `document-account-settings/${saleDocumentTypeId}/chart-accounts`;
