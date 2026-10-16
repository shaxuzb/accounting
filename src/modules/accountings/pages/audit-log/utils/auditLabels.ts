import type { TFunction } from "i18next";

/** An object kind (table) by its name, the table name itself when the journal has no label for it. */
export const auditTableLabel = (t: TFunction, table: string) => {
  const key = `accountings.audit.tables.${table}`;
  const label = t(key);
  return label === key ? table : label;
};

/** A value of a changed field as text: nothing shown as a dash. */
export const auditValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};
