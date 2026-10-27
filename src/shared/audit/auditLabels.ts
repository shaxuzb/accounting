import type { TFunction } from "i18next";

/** camelCase or snake_case as words: docDate → «doc date», sale_doc → «sale doc». */
const humanize = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export const tableLabel = (t: TFunction, table: string) =>
  t(`audit.tables.${table}`, { defaultValue: humanize(table) });

export const fieldLabel = (t: TFunction, field: string) =>
  t(`audit.fields.${field}`, { defaultValue: humanize(field) });

/** The verb of an action, read from its name: Create, Update, Delete, Post, Cancel… */
const verbs: [RegExp, string][] = [
  [/^(create|add|post$|insert)/i, "create"],
  [/(confirm|post|approve|accept|conduct)/i, "post"],
  [/(cancel|unpost|revert|rollback)/i, "cancel"],
  [/(delete|remove)/i, "delete"],
  [/(export|excel|download|file|pdf)/i, "export"],
  [/print/i, "print"],
  [/(update|edit|save|set|change|put)/i, "update"],
];

/** «Qo'lda provodka · Tahrirlash» from ManualEntry.Update. */
export const endpointLabel = (t: TFunction, endpoint?: string | null, method?: string | null) => {
  if (!endpoint) return method ?? "";
  const [controller, action = ""] = endpoint.split(".");
  const section = t(`audit.sections.${controller}`, { defaultValue: humanize(controller) });
  const verb =
    verbs.find(([pattern]) => pattern.test(action))?.[1] ??
    (method === "DELETE" ? "delete" : method === "POST" ? "create" : method === "PUT" ? "update" : null);
  const verbText = verb
    ? t(`audit.verbs.${verb}`)
    : t(`audit.actions.${endpoint}`, { defaultValue: humanize(action) });
  return `${section} · ${verbText}`;
};

export const actionKindLabel = (t: TFunction, kind: string) =>
  t(`audit.kinds.${kind}`, { defaultValue: kind });

export const changeActionLabel = (t: TFunction, action: string, changes: Record<string, unknown[]>) =>
  // a record removed by marking it deleted
  action === "UPDATE" && Array.isArray(changes.stateId) && changes.stateId[1] === 2
    ? t("audit.change.deleted")
    : t(`audit.change.${action}`);

export const formatAuditValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "✓" : "✗";
  if (typeof value === "number") return value.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
  if (typeof value === "string") {
    // a timestamp
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      const [date, time] = value.split("T");
      const [y, m, d] = date.split("-");
      const hm = time.slice(0, 5);
      return hm === "00:00" ? `${d}.${m}.${y}` : `${d}.${m}.${y} ${hm}`;
    }
    return value;
  }
  return JSON.stringify(value);
};

export const formatMinutes = (t: TFunction, minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? t("audit.duration.hm", { h, m }) : t("audit.duration.m", { m });
};
