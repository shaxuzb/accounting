import dayjs from "dayjs";
import type { SourceStatus } from "../types/type";

export type PolicyDisplayKind =
  | "boolean"
  | "date"
  | "month"
  | "valuation"
  | "currency"
  | "policy"
  | "text";

const monthLabels = [
  "—",
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

const nullLabels: Partial<Record<SourceStatus, string>> = {
  3: "Sozlanmagan",
  4: "Manba qiymati yo‘q",
  6: "Aniqlanmagan",
  8: "Mavjud emas",
  9: "Scope’dan tashqari",
};

export const formatAccountingPolicyValue = (
  value: unknown,
  options: { kind: PolicyDisplayKind; status: SourceStatus },
) => {
  if (value === null || value === undefined || value === "") {
    return nullLabels[options.status] ?? "Ko‘rsatilmagan";
  }

  if (options.kind === "date") {
    const parsed = dayjs(String(value));
    return parsed.isValid() ? parsed.format("DD.MM.YYYY") : String(value);
  }

  if (options.kind === "month") {
    const month = Number(value);
    return monthLabels[month] ?? String(value);
  }

  if (options.kind === "boolean") return value ? "Ha" : "Yo‘q";

  const normalized = String(value).toUpperCase();
  if (options.kind === "valuation" && normalized === "FIFO") return "FIFO";
  if (normalized === "PROTECT_CLOSED_PERIOD") return "Yopiq davrni himoyalash";
  if (normalized === "SHIPMENT") return "Yuklash vaqtida";
  if (normalized === "MONTH") return "Oyma-oy";
  if (normalized === "OUT_OF_SCOPE") return "Scope’dan tashqari";

  return String(value);
};
