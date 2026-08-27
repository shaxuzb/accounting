import dayjs from "dayjs";
import { isString } from "formik";

export function numberSpacing(
  item: number | null,
  type?: string,
  isHaveNumber?: boolean,
) {
  return item
    ? item.toString().includes(".")
      ? item
          .toFixed(2)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, type ?? " ")
      : item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, type ?? " ")
    : isHaveNumber
      ? 0
      : "";
}

export function customDate(date: string | undefined) {
  const format = "DD.MM.YYYY HH:mm";
  return dayjs(date).format(format);
}
export function customDate2(date: string | undefined) {
  const format = "DD.MM.YYYY";
  return dayjs(date).format(format);
}


export function numberSpacingWithCurrency(
  item: number,
  currency: string | number,
  type?: string,
) {
  return (
    (item
      ? item.toString().includes(".")
        ? item
            .toFixed(2)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, type ?? " ")
        : item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, type ?? " ")
      : 0) +
    (isString(currency) ? ` ${currency}` : currency === 1 ? " UZS" : " USD")
  );
}

export const formatDate = (
  value?: string | number | Date,
  format = "DD.MM.YYYY  HH:mm",
) => (value ? dayjs(value).format(format) : "-");

export const hexToRgb = (hex: string) => {
  const cleanHex = hex.replace(/^#/, "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

//generate table keys
export const generateKeyTable = <T extends object>(
  data?: T[],
  key?: string | null,
) => {
  return data?.map((item, index) => ({
    ...item,
    key: key ? item?.[key] : index + 1,
    indexId: index + 1,
  }));
};

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const clearLocalStorageExcept = (keysToKeep: string[] = []) => {
  const savedValues: Record<string, string> = {};

  keysToKeep.forEach((key) => {
    const value = localStorage.getItem(key) as string;
    if (value !== null) {
      savedValues[key] = value;
    }
  });

  localStorage.clear();

  Object.entries(savedValues).forEach(([key, value]) => {
    localStorage.setItem(key, value as string);
  });
};

export const getEffectiveTheme = (themeMode: string | null) => {
  if (themeMode === "light") return "light";
  if (themeMode === "dark") return "dark";

  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  return systemPrefersDark ? "dark" : "light";
};

export function customPhoneNumber(number: string) {
  if (!number) return "";
  const digits = number.replace(/\D/g, "");
  return digits.replace(
    /^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2}).*$/,
    "+$1 $2 $3 $4 $5",
  );
}
