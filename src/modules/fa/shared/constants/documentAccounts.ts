export const faDocumentTypeCodes = {
  receipt: "fa_receipt",
  commissioning: "fa_commissioning",
  depreciation: "fa_depreciation",
  revaluation: "fa_revaluation",
  disposal: "fa_disposal",
} as const;

export const faDocumentAccountRoleCodes = {
  supplierSettlement: "supplier_settlement",
  capitalInvestment: "capital_investment",
  inputVat: "input_vat",
  fixedAsset: "fixed_asset",
  accumulatedDepreciation: "accumulated_depreciation",
  depreciationExpense: "depreciation_expense",
  revaluationReserve: "revaluation_reserve",
  revaluationLoss: "revaluation_loss",
  disposal: "disposal",
  customerSettlement: "customer_settlement",
  disposalGain: "disposal_gain",
  disposalLoss: "disposal_loss",
} as const;
