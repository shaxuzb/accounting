import dayjs from "dayjs";
import type {
  BankStatementCardData,
  BankStatementTransaction,
} from "../types/type";

const COUNTERPARTY_MAPPING_CODES = new Set([
  "BANK_SERVICE",
  "COUNTERPARTY",
]);

const normalizeCode = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

export const isExistingBankOperation = (
  transaction: Pick<BankStatementTransaction, "isNewOperation">,
) => transaction.isNewOperation === false;

export const isImportableBankOperation = (
  transaction: Pick<BankStatementTransaction, "isNewOperation">,
) => !isExistingBankOperation(transaction);

export interface BankDocumentMappingContext {
  directionId?: unknown;
  debit?: unknown;
  credit?: unknown;
}

const toPositiveAmount = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export const getBankRelatedDocumentTypeCode = (
  classificationCode: unknown,
  context: BankDocumentMappingContext = {},
) => {
  const code = normalizeCode(classificationCode);

  if (code === "CASH_COLLECTION") return "cash_collection";
  if (code === "PAYMENT_ACCEPTANCE_POINT_OPERATION") {
    return "payment_acceptance_point_operation";
  }

  if (code !== "BANK_SERVICE" && code !== "COUNTERPARTY") return null;

  const directionId = Number(context.directionId);
  if (directionId === 1) return "sale";
  if (directionId === -1) return "purchase";

  const debit = toPositiveAmount(context.debit);
  const credit = toPositiveAmount(context.credit);
  if (debit > 0 && credit === 0) return "sale";
  if (credit > 0 && debit === 0) return "purchase";

  return null;
};

export const buildBankDocumentQueryParams = (
  classificationCode: unknown,
  context?: BankDocumentMappingContext,
) => {
  const documentTypeCode = getBankRelatedDocumentTypeCode(
    classificationCode,
    context,
  );
  return documentTypeCode ? { DocumentTypeCode: documentTypeCode } : {};
};

export interface BankClassificationOption {
  id: number;
  code?: string | null;
  name?: string | null;
}

export const getBankClassificationMetadata = (
  options: readonly BankClassificationOption[],
  categoryId: number | null,
) => {
  const selected = options.find((option) => option.id === categoryId);

  return {
    code: selected?.code ?? null,
    name: selected?.name ?? null,
  };
};

export const canMapBankCounterparty = (classificationCode: unknown) =>
  COUNTERPARTY_MAPPING_CODES.has(normalizeCode(classificationCode));

export interface MissingOrgBankAccountPayload {
  organizationId: number;
  bankId: number;
  bankBranchId: number | null;
  accountNumber: string;
  currencyId: number;
  isMain: boolean;
  stateId: number;
}

const toPositiveInteger = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
};

export const normalizeBankAccountNumber = (value: unknown) =>
  String(value ?? "")
    .replace(/\s/g, "")
    .trim();

export const buildMissingOrgBankAccountPayload = (
  card: Pick<
    BankStatementCardData,
    "bankId" | "bankBranchId" | "accountNumber"
  >,
  organizationId: unknown,
  currencyId: unknown,
): MissingOrgBankAccountPayload | null => {
  const validOrganizationId = toPositiveInteger(organizationId);
  const validBankId = toPositiveInteger(card.bankId);
  const validCurrencyId = toPositiveInteger(currencyId);
  const accountNumber = normalizeBankAccountNumber(card.accountNumber);

  if (!validOrganizationId || !validBankId || !validCurrencyId || !accountNumber) {
    return null;
  }

  return {
    organizationId: validOrganizationId,
    bankId: validBankId,
    bankBranchId: toPositiveInteger(card.bankBranchId),
    accountNumber,
    currencyId: validCurrencyId,
    isMain: false,
    stateId: 1,
  };
};

export const getBankAccountIdFromResponse = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;
  const value =
    record.id ??
    record.bankAccountId ??
    nested?.id ??
    nested?.bankAccountId;
  return toPositiveInteger(value);
};

export interface OrgBankAccountMatchCandidate {
  id: number;
  organizationId?: number | null;
  bankId: number;
  bankBranchId?: number | null;
  accountNumber: string;
  currencyId?: number | null;
}

export const findMatchingOrgBankAccount = (
  card: Pick<
    BankStatementCardData,
    "bankId" | "bankBranchId" | "accountNumber" | "currencyId" | "bankAccountId"
  >,
  accounts: readonly OrgBankAccountMatchCandidate[],
  organizationId: unknown,
  bankIdFallback?: unknown,
) => {
  const accountNumber = normalizeBankAccountNumber(card.accountNumber);
  const validOrganizationId = toPositiveInteger(organizationId);
  const validBankId = toPositiveInteger(card.bankId ?? bankIdFallback);
  const validBranchId = toPositiveInteger(card.bankBranchId);
  const validCurrencyId = toPositiveInteger(card.currencyId);

  if (!accountNumber || !validBankId) return null;

  const candidates = accounts.filter((account) => {
    const accountId = toPositiveInteger(account.id);
    const accountOrganizationId = toPositiveInteger(account.organizationId);
    const accountBankId = toPositiveInteger(account.bankId);

    return (
      accountId &&
      accountBankId === validBankId &&
      normalizeBankAccountNumber(account.accountNumber) === accountNumber &&
      (!validOrganizationId || accountOrganizationId === validOrganizationId) &&
      (!validBranchId || toPositiveInteger(account.bankBranchId) === validBranchId) &&
      (!validCurrencyId || toPositiveInteger(account.currencyId) === validCurrencyId)
    );
  });

  return candidates.length === 1 ? candidates[0] : null;
};

/**
 * Bank statement dates are calendar values. Keep their source date/time and
 * avoid converting them through UTC, which can move midnight to the previous
 * day in the Asia/Tashkent timezone.
 */
export const formatBankOperationDate = (value: unknown): string | null => {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return null;

  const isoLikeMatch = rawValue.match(
    /^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}(?::\d{2})?))?/,
  );

  if (isoLikeMatch) {
    const datePart = isoLikeMatch[1];
    const parsedDate = dayjs(datePart);

    if (
      !parsedDate.isValid() ||
      parsedDate.format("YYYY-MM-DD") !== datePart
    ) {
      return null;
    }

    const timePart = isoLikeMatch[2]
      ? isoLikeMatch[2].length === 5
        ? `${isoLikeMatch[2]}:00`
        : isoLikeMatch[2]
      : "00:00:00";

    return `${datePart}T${timePart}`;
  }

  const parsedDate = dayjs(rawValue);
  return parsedDate.isValid()
    ? parsedDate.format("YYYY-MM-DDTHH:mm:ss")
    : null;
};

const toDateKey = (value: unknown) => {
  const date = String(value ?? "").trim();
  return date ? date.slice(0, 10) : "";
};

export const isBankStatementDateInRange = (
  value: unknown,
  dateFrom?: string,
  dateTo?: string,
) => {
  const dateKey = toDateKey(value);
  const fromKey = toDateKey(dateFrom);
  const toKey = toDateKey(dateTo);

  if (!fromKey && !toKey) return true;
  if (!dateKey) return false;
  if (fromKey && dateKey < fromKey) return false;
  if (toKey && dateKey > toKey) return false;

  return true;
};
