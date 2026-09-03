export const selectListEndpoints = {
  statesSelectList: "manuals/states",
  regionsSelectList: "manuals/regions",
  districtsSelectList: "manuals/districts",
  currenciesSelectList: "manuals/currencies",
  unitsSelectList: "manuals/units",
  documentStatusesSelectList: "manuals/document-statuses",
  counterparty: "manuals/counterparties",
  paymentTypesSelectList: "manuals/payment-types",
  paymentPurposesSelectList: "manuals/payment-purposes",
  banksSelectList: "manuals/banks",
  bankBranchesSelectList: "manuals/bank-branches",
  bankOperationCategoriesSelectList: "manuals/bank-operation-categories",
  documentTypesSelectList: "manuals/document-types",
  documentsSelectList: "documents",
  productTypesSelectList: "manuals/product-types",
  organizationsSelectList: "manuals/organizations",
  operationTypesSelectList: "manuals/operation-types",
  bankOperationTypesSelectList: "manuals/operation-types",
  taxTypesSelectList: "manuals/tax-types",
  regulatedObligationsSelectList: "manuals/regulated-obligations",
  regulatedObligationPeriodicitiesSelectList:
    "manuals/regulated-obligation-periodicities",
  vatRatesSelectList: "manuals/vat-rates",
  rolesSelectList: "manuals/roles",
  usersSelectList: "manuals/users",
  branchesSelectList: "manuals/branches",
  departmentsSelectList: "manuals/departments",
  positionsSelectList: "manuals/positions",
  counterpartiesSelectList: "manuals/counterparties",
  productGroupsSelectList: "manuals/product-groups",
  productsSelectList: "manuals/products",
  purchaseServicesSelectList: "manuals/purchase-services",
  warehousesSelectList: "manuals/warehouses",
  chartAccountsSelectList: "manuals/chart-accounts",
  orgBankAccountsSelectList: "manuals/org-bank-accounts",
  cashBoxesSelectList: "manuals/cash-boxes",
  fiscalCashRegistersSelectList: "manuals/fiscal-cash-registers",
  fiscalCashRegisterTypesSelectList: "manuals/fiscal-cash-register-types",
  paymentAcceptancePointsSelectList: "manuals/payment-acceptance-points",
  paymentAcceptancePointTypesSelectList:
    "manuals/payment-acceptance-point-types",
  paymentMethodsSelectList: "manuals/payment-methods",
  cashOperationsSelectList: "manuals/cash-operations",
  languagesSelectList: "manuals/languages",
  contractsSelectList: "manuals/contracts",
  contractTypeSelectList: "manuals/contract-types",
  serviceTypesSelectList: "manuals/purchase-service-types",
  pricingMethodsSelectList: "manuals/pricing-methods",
  priceRoundingMethodsSelectList: "manuals/price-rounding-methods",
  costingMethodsSelectList: "manuals/costing-methods",
  faGroupsSelectList: "manuals/fa-groups",
  okofsSelectList: "manuals/fa-okofs",
  depreciationMethodsSelectList: "manuals/fa-depreciation-methods",
  faReceiptTypesSelectList: "manuals/fa-receipt-types",
  faDisposalTypesSelectList: "manuals/fa-disposal-types",
  sourceProductTablesSelectList: "manuals/source-product-tables",
  counterPartyBankAccounts: "manuals/counterparty-bank-accounts",
  paymentPurposes: "manuals/payment-purposes",
  operationTypes: "manuals/operation-types",
  vatRates: "manuals/vat-rates",
  subkontoTypes: "manuals/subkonto-types",
  accountType: "manuals/account-types",
  inventoryAdjustmentTypes: "manuals/inventory-adjustment-types",
  moduleSubGroups: "manuals/module-sub-groups",
  accountingPolicies: "manuals/accounting-policies",
  faAssetsSelectList: "manuals/fa-assets",
  chartAccountSelect: "manuals/chart-accounts",
};

export const chartAccountOptionLabel = (item: {
  number?: unknown;
  code?: unknown;
  name?: unknown;
}) => {
  const number = String(item.number ?? item.code ?? "").trim();
  const name = String(item.name ?? "").trim();
  return [number, name].filter(Boolean).join(" - ") || number || name;
};

export const chartAccountSelectedLabel = (item: {
  number?: unknown;
  code?: unknown;
  name?: unknown;
}) => String(item.number ?? item.code ?? item.name ?? "").trim();

export const chartAccountNumberSelectedLabel = (item: {
  number?: unknown;
  code?: unknown;
}) => String(item.number ?? item.code ?? "").trim();

export const chartAccountSelectDisplayConfig = {
  optionLabel: chartAccountOptionLabel,
  selectedLabel: chartAccountSelectedLabel,
  searchFields: ["number", "code", "name"],
} as const;

type CounterpartySelectItem = {
  name?: unknown;
  fullName?: unknown;
  shortName?: unknown;
  inn?: unknown;
};

const getCounterpartyName = (item: CounterpartySelectItem) =>
  String(item.name ?? item.fullName ?? item.shortName ?? "").trim();

export const counterpartyOptionLabel = (item: CounterpartySelectItem) => {
  const name = getCounterpartyName(item);
  const inn = String(item.inn ?? "").trim();
  return [name, inn].filter(Boolean).join(" - ") || name || inn;
};

export const counterpartySelectedLabel = (item: CounterpartySelectItem) =>
  getCounterpartyName(item) || String(item.inn ?? "").trim();

export const counterpartySelectDisplayConfig = {
  optionLabel: counterpartyOptionLabel,
  selectedLabel: counterpartySelectedLabel,
  searchFields: ["name", "fullName", "shortName", "inn"],
} as const;

export const selectListKeys = {
  state: "selectListStates",
  region: "selectListRegions",
  district: "selectListDistricts",
  currency: "selectListCurrencies",
  unit: "selectListUnits",
  documentStatus: "selectListDocumentStatuses",
  paymentType: "selectListPaymentTypes",
  paymentPurpose: "selectListPaymentPurposes",
  bank: "selectListBanks",
  documentType: "selectListDocumentTypes",
  operationType: "selectListOperationTypes",
  taxType: "selectListTaxTypes",
  vatRate: "selectListVatRates",
  role: "selectListRoles",
  user: "selectListUsers",
  branch: "selectListBranches",
  department: "selectListDepartments",
  position: "selectListPositions",
  counterparty: "selectListCounterparties",
  productGroup: "selectListProductGroups",
  product: "selectListProducts",
  purchaseService: "selectListPurchaseServices",
  warehouse: "selectListWarehouses",
  chartAccount: "selectListChartAccounts",
  orgBankAccount: "selectListOrgBankAccounts",
  organization: "selectListOrganization",
  cashBox: "selectListCashBoxes",
  fiscalCashRegister: "selectListFiscalCashRegisters",
  fiscalCashRegisterType: "selectListFiscalCashRegisterTypes",
  paymentMethod: "selectListPaymentMethods",
  cashOperation: "selectListCashOperations",
  language: "selectListLanguages",
  contract: "selectListContract",
  contractType: "selectListContractTypes",
  serviceType: "selectListServiceTypes",
  pricingMethod: "selectListPricingMethods",
  priceRoundingMethod: "selectListPriceRoundingMethods",
  costingMethod: "selectListCostingMethods",
  faGroup: "selectListFaGroups",
  okof: "selectListOkofs",
  depreciationMethod: "selectListDepreciationMethods",
  sourceProductTable: "selectListSourceProductTables",
  counterPartyBankAccount: "selectListCounterPartyBankAccounts",
  paymentPurposes: "selectListPaymentPurposes",
  operationTypes: "selectListOperationTypes",
  vatRates: "selectListVatRates",
  inventoryAdjustmentTypes: "selectListInventoryAdjustmentTypes",
  moduleSubGroups: "selectListModuleSubGroups",
  accountingPolicies: "selectListAccountingPolicies",
};

export const filterIds = {
  state: "stateId",
  region: "regionId",
  district: "districtId",
  currency: "currencyId",
  unit: "unitId",
  documentStatus: "documentStatusId",
  paymentType: "paymentTypeId",
  bank: "bankId",
  documentType: "documentTypeId",
  operationType: "operationTypeId",
  taxType: "taxTypeId",
  vatRate: "vatRateId",
  role: "roleId",
  user: "userId",
  branch: "branchId",
  department: "departmentId",
  position: "positionId",
  counterparty: "counterpartyId",
  productGroup: "productGroupId",
  product: "productId",
  purchaseService: "serviceId",
  warehouse: "warehouseId",
  chartAccount: "chartAccountId",
  orgBankAccount: "orgBankAccountId",
  cashBox: "cashBoxId",
  fiscalCashRegister: "fiscalCashRegisterId",
  fiscalCashRegisterType: "registerTypeId",
  paymentMethod: "paymentMethodId",
  cashOperation: "cashOperationId",
  language: "languageId",
  contractType: "contractTypeId",
  contract: "contractId",
  serviceType: "serviceTypeId",
  pricingMethod: "pricingMethodId",
  priceRoundingMethod: "priceRoundingMethodId",
  costingMethod: "costingMethodId",
  faGroup: "faGroupId",
  okof: "okofId",
  depreciationMethod: "depreciationMethodId",
  sourceProductTable: "sourceProductTableId",
  counterPartyBankAccount: "counterPartyBankAccountId",
  paymentPurposes: "paymentPurposeId",
  operationTypes: "operationTypeId",
  vatRates: "vatRateId",
  inventoryAdjustmentTypes: "inventoryAdjustmentTypeId",
  moduleSubGroups: "moduleSubGroupId",
  accountingPolicies: "accountingPolicyId",
};
