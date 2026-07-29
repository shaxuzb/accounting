import dayjs from "dayjs";
import { numberSpacing } from "@/utils/utils";

export const DATE_ONLY_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

/** Ekranda ko'rsatiladigan sana: 31.07.2026 */
export const displayDate = (value?: string | null) =>
  value ? dayjs(value).format("DD.MM.YYYY") : "—";

/** Backendga yuboriladigan DateOnly qiymati. */
export const toDateOnly = (value?: string | null) =>
  value ? dayjs(value).format(DATE_ONLY_FORMAT) : null;

/** Backendga yuboriladigan DateTime qiymati. */
export const toDateTime = (value?: string | null) =>
  value ? dayjs(value).format(DATE_TIME_FORMAT) : "";

/** Telefonni +998901234567 ko'rinishiga keltiradi. */
export const normalizePhone = (value?: string | null) => {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits ? `+${digits}` : null;
};

/** Bo'sh matnni null ga aylantiradi (backend ixtiyoriy maydonlari uchun). */
export const emptyToNull = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
};

/** Pul summasi: 5 180 000 */
export const money = (value?: number | null) =>
  value == null ? "—" : numberSpacing(value, undefined, true).toString();

/** Pul summasi valyuta bilan. */
export const moneyWith = (value?: number | null, currency?: string | null) =>
  value == null ? "—" : `${money(value)} ${currency ?? ""}`.trim();

/** Xodimning to'liq ismi. */
export const employeeFullName = (employee?: {
  fullName?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
} | null) => {
  if (!employee) return "—";
  if (employee.fullName) return employee.fullName;
  return (
    [employee.lastName, employee.firstName, employee.middleName]
      .filter(Boolean)
      .join(" ") || "—"
  );
};

/** Davr sarlavhasi: 2026-yil iyul */
export const periodLabel = (
  year?: number | null,
  month?: number | null,
  monthName?: string,
) => {
  if (!year || !month) return "—";
  return monthName ? `${monthName} ${year}` : `${month}.${year}`;
};
