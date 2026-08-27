import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";

const statementCollectionKeys = [
  "statements",
  "statement",
  "documents",
  "accounts",
  "data",
  "result",
  "items",
];

const transactionKeys = [
  "transactions",
  "operations",
  "bankOperations",
  "rows",
  "details",
  "entries",
  "items",
];

const dateKeys = [
  "docDate",
  "date",
  "operationDate",
  "paymentDate",
  "transactionDate",
];

const accountKeys = [
  "account",
  "accountNumber",
  "bankAccount",
  "bankAccountNumber",
  "counterpartyAccount",
];

const counterpartyKeys = [
  "counterparty",
  "counterpartyName",
  "payer",
  "payerName",
  "recipient",
  "recipientName",
  "receiver",
  "receiverName",
];

const commentKeys = [
  "comment",
  "description",
  "purpose",
  "paymentPurpose",
  "details",
];

const debitKeys = ["debit", "debitAmount", "outcome", "expense"];
const creditKeys = ["credit", "creditAmount", "income", "receipt"];
const amountKeys = ["amount", "sum", "total", "paymentAmount"];
const directionKeys = ["direction"];
const directionIdKeys = ["directionId"];
const bankAccountIdKeys = ["bankAccountId", "accountId", "orgBankAccountId"];
const operationTypeIdKeys = ["operationTypeId", "operationId"];
const currencyIdKeys = ["currencyId"];
const counterpartyIdKeys = ["counterpartyId"];
const contractIdKeys = ["contractId"];
const bankDocumentNumberKeys = ["bankDocumentNumber", "bankDocNumber"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const getByKeys = (record: Record<string, unknown>, keys: string[]) => {
  const lowerMap = new Map(
    Object.keys(record).map((key) => [key.toLowerCase(), key]),
  );

  for (const key of keys) {
    const realKey = lowerMap.get(key.toLowerCase());
    if (realKey) return record[realKey];
  }

  return undefined;
};

const getStringByKeys = (record: Record<string, unknown>, keys: string[]) => {
  const value = getByKeys(record, keys);
  if (value === null || value === undefined) return undefined;
  return String(value);
};

const getNumberByKeys = (record: Record<string, unknown>, keys: string[]) =>
  toNumber(getByKeys(record, keys));

const getOperationTypeIdByDirection = (
  direction: string,
  directionId: number | null,
) => {
  const normalizedDirection = direction.trim().toLowerCase();

  if (
    normalizedDirection === "incoming" ||
    normalizedDirection === "in" ||
    normalizedDirection === "credit" ||
    directionId === 1
  ) {
    return 1;
  }

  if (
    normalizedDirection === "outgoing" ||
    normalizedDirection === "out" ||
    normalizedDirection === "debit" ||
    directionId === -1
  ) {
    return 2;
  }

  return null;
};

const getTransactionArray = (record: Record<string, unknown>) => {
  for (const key of transactionKeys) {
    const value = getByKeys(record, [key]);
    if (Array.isArray(value)) return value;
  }

  return [];
};

const normalizeTransaction = (
  value: unknown,
  _index: number,
  cardDefaults?: Partial<BankStatementCardData>,
): BankStatementTransaction => {
  const fields = isRecord(value) ? value : { value };
  const sourceDebit = toNumber(getByKeys(fields, debitKeys));
  const sourceCredit = toNumber(getByKeys(fields, creditKeys));
  const direction = getStringByKeys(fields, directionKeys) ?? "";
  const directionId = getNumberByKeys(fields, directionIdKeys);
  const directionOperationTypeId = getOperationTypeIdByDirection(
    direction,
    directionId,
  );
  // The parser already reports debit/credit relative to the organization.
  // Keep the DTO semantics intact; directionId is the source of truth for logic.
  const debit = sourceDebit ?? 0;
  const credit = sourceCredit ?? 0;
  const dtoAmount = toNumber(getByKeys(fields, amountKeys));
  const amount =
    dtoAmount ?? Math.abs((sourceCredit ?? 0) - (sourceDebit ?? 0));

  return {
    date: getStringByKeys(fields, dateKeys) ?? "",
    docNumber: getStringByKeys(fields, ["docNumber", "documentNumber"]) ?? "",
    bankDocumentNumber:
      getStringByKeys(fields, bankDocumentNumberKeys) ?? null,
    operationTypeId:
      directionOperationTypeId ??
      getNumberByKeys(fields, operationTypeIdKeys) ??
      cardDefaults?.operationTypeId ??
      0,
    operationCode: getStringByKeys(fields, ["operationCode"]) ?? "",
    mfoCounterparty: getStringByKeys(fields, ["mfoCounterparty", "mfo"]) ?? "",
    counterpartyAccount: getStringByKeys(fields, ["counterpartyAccount"]) ?? "",
    counterpartyInn: getStringByKeys(fields, ["counterpartyInn", "inn"]) ?? "",
    counterpartyName:
      getStringByKeys(fields, ["counterpartyName", ...counterpartyKeys]) ?? "",
    counterpartyId: getNumberByKeys(fields, counterpartyIdKeys),
    debit,
    credit,
    purpose: getStringByKeys(fields, commentKeys) ?? "",
    direction,
    directionId,
    amount,
    currencyId: getNumberByKeys(fields, currencyIdKeys) ?? undefined,
    currencyName: getStringByKeys(fields, ["currencyName", "currency"]) ?? undefined,
    contractId: getNumberByKeys(fields, contractIdKeys) ?? null,
    counterpartyBankAccountId: getNumberByKeys(
      fields,
      ["counterpartyBankAccountId"],
    ),
    classificationCategoryId: getNumberByKeys(fields, [
      "classificationCategoryId",
    ]),
    classificationCode:
      getStringByKeys(fields, ["classificationCode"]) ?? null,
    classificationName:
      getStringByKeys(fields, ["classificationName"]) ?? null,
    classificationRuleId: getNumberByKeys(fields, ["classificationRuleId"]),
    classificationRuleCode:
      getStringByKeys(fields, ["classificationRuleCode"]) ?? null,
    requiresReview:
      getByKeys(fields, ["requiresReview"]) === true ||
      String(getByKeys(fields, ["requiresReview"]) ?? "").toLowerCase() ===
        "true",
  };
};

const getCardTitle = (
  record: Record<string, unknown>,
  fallback: string,
  index: number,
) =>
  String(
    getByKeys(record, [
      "bankName",
      "bank",
      "organizationName",
      "accountName",
      "name",
      "title",
    ]) ?? `${fallback} ${index + 1}`,
  );

const normalizeCard = (
  value: unknown,
  index: number,
  fileName?: string,
): BankStatementCardData => {
  const record = isRecord(value) ? value : { transactions: [value] };
  const cardDefaults: Partial<BankStatementCardData> = {
    bankAccountId: getNumberByKeys(record, bankAccountIdKeys),
    bankId: getNumberByKeys(record, ["bankId"]),
    bankBranchId: getNumberByKeys(record, ["bankBranchId"]),
    bankMfo: getStringByKeys(record, ["bankMfo"]),
    bankName: getStringByKeys(record, ["bankName"]),
    bankInn: getStringByKeys(record, ["bankInn"]) ?? null,
    companyName: getStringByKeys(record, ["companyName"]),
    companyInn: getStringByKeys(record, ["companyInn"]),
    accountNumber: getStringByKeys(record, accountKeys),
    currencyId: getNumberByKeys(record, currencyIdKeys),
    operationTypeId: getNumberByKeys(record, operationTypeIdKeys),
    totalDebit: getNumberByKeys(record, ["totalDebit"]),
    totalCredit: getNumberByKeys(record, ["totalCredit"]),
    openingBalance: getNumberByKeys(record, ["openingBalance"]),
    closingBalance: getNumberByKeys(record, ["closingBalance"]),
    hasActivity: getByKeys(record, ["hasActivity"]) as boolean | undefined,
    periodFrom: getStringByKeys(record, ["periodFrom"]),
    periodTo: getStringByKeys(record, ["periodTo"]),
    dateFrom: getStringByKeys(record, ["periodFrom", "dateFrom", "startDate", "fromDate"]),
    dateTo: getStringByKeys(record, ["periodTo", "dateTo", "endDate", "toDate"]),
  };
  const transactions = getTransactionArray(record).map((transaction, txIndex) =>
    normalizeTransaction(transaction, txIndex, cardDefaults),
  );

  return {
    id: String(getByKeys(record, ["id", "statementId"]) ?? `${index}-${Date.now()}`),
    fileName,
    title: getCardTitle(record, fileName ?? "Bank statement", index),
    ...cardDefaults,
    transactions,
    raw: value,
  };
};

const unwrapResponse = (response: unknown): unknown => {
  if (!isRecord(response)) return response;

  for (const key of statementCollectionKeys) {
    const value = getByKeys(response, [key]);
    if (Array.isArray(value)) return value;
    if (isRecord(value)) return unwrapResponse(value);
  }

  return response;
};

export const normalizeBankStatements = (
  response: unknown,
  fileName?: string,
): BankStatementCardData[] => {
  const payload = unwrapResponse(response);

  if (Array.isArray(payload)) {
    if (payload.length === 0) return [];
    const hasNestedTransactions = payload.some(
      (item) => isRecord(item) && getTransactionArray(item).length > 0,
    );

    if (hasNestedTransactions) {
      return payload.map((item, index) => normalizeCard(item, index, fileName));
    }

    return [
      {
        id: `file-${Date.now()}`,
        fileName,
        title: fileName ?? "Bank statement",
        bankAccountId: null,
        currencyId: null,
        operationTypeId: null,
        transactions: payload.map((item, index) =>
          normalizeTransaction(item, index),
        ),
        raw: response,
      },
    ];
  }

  return [normalizeCard(payload, 0, fileName)];
};
