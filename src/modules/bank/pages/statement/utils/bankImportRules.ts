import dayjs from "dayjs";

const COUNTERPARTY_MAPPING_CODES = new Set([
  "BANK_SERVICE",
  "COUNTERPARTY",
]);

const normalizeCode = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

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
