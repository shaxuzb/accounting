export const getApiText = (source: object, ...keys: string[]) => {
  const record = source as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
};

export const formatReceiptAmount = (value?: number | null) =>
  new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

