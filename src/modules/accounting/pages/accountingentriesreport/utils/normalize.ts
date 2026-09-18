import type {
  AccountingEntriesReportPosting,
  AccountingEntriesReport,
  AccountingEntriesReportSubkontoItem,
} from "../types/type";

const getValue = <T = unknown>(
  source: Record<string, unknown>,
  keys: string[],
  fallback?: T,
) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return fallback as T;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const toNumber = (value: unknown) => {
  const parsed = Number(
    String(value ?? 0)
      .replace(/\s/g, "")
      .replace(",", "."),
  );
  return Number.isFinite(parsed) ? parsed : 0;
};

const tableSideMap: Record<string, "debit" | "credit"> = {
  DR: "debit",
  CR: "credit",
};

const tableTypeLabel: Record<number, string> = {
  1: "Tovar:",
  2: "Ombor:",
  3: "Kontragent:",
};

const toSubkontoItem = (
  value: unknown,
  side?: "debit" | "credit",
): AccountingEntriesReportSubkontoItem => {
  const record = toRecord(value);
  const tableSide = String(getValue(record, ["side"], "")).toUpperCase();
  const subkontoTypeId = toNumber(getValue(record, ["subkontoTypeId"], 0));
  const label = String(
    getValue(
      record,
      ["label", "name", "key", "type", "title"],
      tableTypeLabel[subkontoTypeId] ?? "",
    ),
  );
  const rawItemValue = getValue(
    record,
    ["value", "displayValue", "name", "text", "title"],
    value ?? "",
  );
  const itemValue =
    rawItemValue && typeof rawItemValue === "object"
      ? JSON.stringify(rawItemValue)
      : String(rawItemValue ?? "");
  return { label, value: itemValue, side: side ?? tableSideMap[tableSide] };
};

const readSubkonto = (record: Record<string, unknown>) =>
  toArray(
    getValue(
      record,
      ["subkonto", "subcontos", "analytics", "details", "tables"],
      [],
    ),
  )
    .map((item) => toSubkontoItem(item))
    .filter((item) => item.value);

const readDetails = (
  record: Record<string, unknown>,
  keys: string[],
  side: "debit" | "credit",
) =>
  toArray(getValue(record, keys, []))
    .map((item) => toSubkontoItem(item, side))
    .filter((item) => item.value);

const readTableDetails = (
  record: Record<string, unknown>,
  side: "debit" | "credit",
) =>
  toArray(getValue(record, ["tables"], []))
    .map((item) => toSubkontoItem(item))
    .filter((item) => item.value && item.side === side);

export const normalizeAccountingEntriesReport = (
  response: unknown,
): AccountingEntriesReport => {
  const root = toRecord(response);
  const data = toRecord(getValue(root, ["data", "result"], root));
  const rawRows = Array.isArray(response)
    ? response
    : toArray(
        getValue(data, ["postings", "items", "results", "entries", "rows"], []),
      );

  const postings: AccountingEntriesReportPosting[] = rawRows.map(
    (row, index) => {
      const item = toRecord(row);
      const debit = toRecord(
        getValue(item, ["debit", "debitAccount", "dt"], {}),
      );
      const credit = toRecord(
        getValue(item, ["credit", "creditAccount", "ct"], {}),
      );
      const debitDetails =
        readDetails(
          item,
          ["debitDetails", "debitSubkonto", "debitAnalytics"],
          "debit",
        ).length > 0
          ? readDetails(
              item,
              ["debitDetails", "debitSubkonto", "debitAnalytics"],
              "debit",
            )
          : readTableDetails(item, "debit");
      const creditDetails =
        readDetails(
          item,
          ["creditDetails", "creditSubkonto", "creditAnalytics"],
          "credit",
        ).length > 0
          ? readDetails(
              item,
              ["creditDetails", "creditSubkonto", "creditAnalytics"],
              "credit",
            )
          : readTableDetails(item, "credit");

      return {
        id: getValue(item, ["id", "entryId"], index + 1),
        date: String(
          getValue(item, ["date", "entryDate", "createdDate", "docDate"], ""),
        ),
        quantity: String(getValue(item, ["creditQuantity"], "")),
        debitAccountCode: String(
          getValue(
            item,
            ["debitAccountCode", "debetCode", "debitCode"],
            getValue(debit, ["code"], ""),
          ),
        ),
        debitAccountNumber: String(
          getValue(
            item,
            ["debitAccountNumber", "debetNumber", "debitNumber"],
            getValue(debit, ["number"], ""),
          ),
        ),
        debitAccountName: String(
          getValue(
            item,
            ["debitAccountName", "debetName", "debitName"],
            getValue(debit, ["name"], ""),
          ),
        ),
        creditAccountCode: String(
          getValue(
            item,
            ["creditAccountCode", "creditCode"],
            getValue(credit, ["code"], ""),
          ),
        ),
        creditAccountNumber: String(
          getValue(
            item,
            ["creditAccountNumber", "creditNumber"],
            getValue(credit, ["number"], ""),
          ),
        ),
        creditAccountName: String(
          getValue(
            item,
            ["creditAccountName", "creditName"],
            getValue(credit, ["name"], ""),
          ),
        ),
        amount: toNumber(
          getValue(item, ["amount", "sum", "total", "price"], 0),
        ),
        currency: String(
          getValue(item, ["currencyCode", "currency", "currencyName"], ""),
        ),
        documentNumber: String(
          getValue(
            item,
            ["documentNumber", "docNumber", "documentNo"],
            readTableDetails(item, "debit")
              .find((detail) => detail.value.includes("number:"))
              ?.value.replace(/^number:\s*/, "")
              .split(";")[0] ?? "",
          ),
        ),
        subkonto: readSubkonto(item),
        debitDetails,
        creditDetails,
      };
    },
  );

  const first = postings[0];
  return {
    date: String(
      getValue(data, ["date", "createdDate", "docDate"], first?.date ?? ""),
    ),
    totalCount: toNumber(
      getValue(data, ["totalCount", "count"], postings.length),
    ),
    totalAmount: toNumber(
      getValue(
        data,
        ["totalAmount", "totalSum", "amount"],
        postings.reduce((sum, item) => sum + item.amount, 0),
      ),
    ),
    currency: String(
      getValue(data, ["currencyCode", "currency"], first?.currency ?? ""),
    ),
    documentNumber: String(
      getValue(
        data,
        ["documentNumber", "docNumber", "documentNo"],
        first?.documentNumber ?? "",
      ),
    ),
    postings,
  };
};
