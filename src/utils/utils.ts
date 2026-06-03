import dayjs from "dayjs";

export const formatDate = (
  value?: string | number | Date,
  format = "DD.MM.YYYY",
) => (value ? dayjs(value).format(format) : "-");

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
