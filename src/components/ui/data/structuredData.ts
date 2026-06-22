import dayjs from "dayjs";

export interface StructuredDataEntry {
  label?: string;
  value: string;
}

const knownLabels: Record<string, string> = {
  id: "ID",
  number: "Raqam",
  name: "Nomi",
  code: "Kod",
  product: "Mahsulot",
  productId: "Mahsulot ID",
  productName: "Mahsulot",
  warehouse: "Ombor",
  warehouseId: "Ombor ID",
  warehouseName: "Ombor",
  counterparty: "Kontragent",
  counterpartyId: "Kontragent ID",
  counterpartyName: "Kontragent",
  documentNumber: "Hujjat raqami",
  markingNumber: "Markirovka",
  serialNumber: "Seriya raqami",
  quantity: "Miqdor",
  amount: "Summa",
  price: "Narx",
  currency: "Valyuta",
  currencyCode: "Valyuta",
  date: "Sana",
};

const hiddenPathKeys = new Set([
  "purchase",
  "purchasedoc",
  "purchasedocument",
  "sale",
  "saledoc",
  "saledocument",
]);

const humanizeKey = (key: string) => {
  if (knownLabels[key]) return knownLabels[key];
  const readable = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return readable
    ? readable.charAt(0).toLocaleUpperCase() + readable.slice(1)
    : "";
};

const parseJsonString = (value: string): unknown => {
  let current: unknown = value.trim();

  for (let depth = 0; depth < 3 && typeof current === "string"; depth += 1) {
    const text = current.trim();
    const looksLikeJson =
      (text.startsWith("{") && text.endsWith("}")) ||
      (text.startsWith("[") && text.endsWith("]")) ||
      (text.startsWith('"') && text.endsWith('"'));
    if (!looksLikeJson) break;

    try {
      current = JSON.parse(text) as unknown;
    } catch {
      break;
    }
  }

  return current;
};

const parseLoosePairs = (value: string): Record<string, string> | null => {
  const parts = value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const singlePairLooksValid =
    parts.length === 1 && /^[^\d:][^:]{0,40}:/.test(parts[0]);
  if (
    !parts.length ||
    !parts.every((part) => part.includes(":")) ||
    (parts.length === 1 && !singlePairLooksValid)
  ) {
    return null;
  }

  return Object.fromEntries(
    parts.map((part) => {
      const separatorIndex = part.indexOf(":");
      return [
        part.slice(0, separatorIndex).trim(),
        part.slice(separatorIndex + 1).trim(),
      ];
    }),
  );
};

const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const primitiveText = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Ha" : "Yo'q";
  if (
    typeof value === "string" &&
    isoDatePattern.test(value) &&
    dayjs(value).isValid()
  ) {
    return dayjs(value).format("DD.MM.YYYY HH:mm");
  }
  return String(value);
};

const flattenValue = (
  value: unknown,
  path: string[] = [],
): StructuredDataEntry[] => {
  const parsed = typeof value === "string" ? parseJsonString(value) : value;

  if (typeof parsed === "string") {
    const loosePairs = parseLoosePairs(parsed);
    if (loosePairs) return flattenValue(loosePairs, path);
  }

  if (Array.isArray(parsed)) {
    return parsed.flatMap((item, index) =>
      flattenValue(item, parsed.length > 1 ? [...path, String(index + 1)] : path),
    );
  }

  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed).flatMap(([key, itemValue]) =>
      flattenValue(itemValue, [...path, key]),
    );
  }

  const label = path
    .filter((part) => !hiddenPathKeys.has(part.toLocaleLowerCase()))
    .map((part) => (/^\d+$/.test(part) ? part : humanizeKey(part)))
    .filter(Boolean)
    .join(" · ");
  return [{ label: label || undefined, value: primitiveText(parsed) }];
};

export const formatStructuredData = (value: unknown): StructuredDataEntry[] =>
  flattenValue(value);
