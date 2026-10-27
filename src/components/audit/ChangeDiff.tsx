import { useTranslation } from "react-i18next";
import { fieldLabel, formatAuditValue } from "@/shared/audit/auditLabels";

/** Fields the user did not enter: the row's own bookkeeping. */
const hiddenFields = new Set(["id", "organizationId", "createdByUserId", "createdBy", "createdDate", "createdAt", "ownerId"]);

/** An analytics list ([{displayValue}…]) as its names; anything else as the journal formats it. */
const display = (value: unknown, label?: string) => {
  if (label) return label;
  if (Array.isArray(value) && value.every((item) => item && typeof item === "object" && "displayValue" in item))
    return value.map((item) => (item as { displayValue?: string }).displayValue ?? "").join(", ") || "—";
  return formatAuditValue(value);
};

/**
 * The fields a change touched: the old value struck through, the new one beside it. Ids show as
 * the names the server found for them; a line's link to its document is left out.
 */
export default function ChangeDiff({
  action,
  changes,
  labels = {},
  parentId,
}: {
  action: string;
  changes: Record<string, unknown[]>;
  labels?: Record<string, string>;
  /** The document a line belongs to: the field that points to it is not shown. */
  parentId?: string;
}) {
  const { t } = useTranslation();
  const entries = Object.entries(changes).filter(
    ([field, [before, after]]) =>
      !hiddenFields.has(field) &&
      !(parentId && field.endsWith("Id") && String(after ?? before) === parentId && action !== "UPDATE"),
  );

  if (!entries.length) return null;

  const label = (field: string, value: unknown) =>
    typeof value !== "number"
      ? undefined
      : (labels[`${field}:${value}`] ??
        (field === "stateId" ? t(`audit.values.stateId.${value}`, { defaultValue: "" }) || undefined : undefined));

  return (
    <div className="grid grid-cols-[minmax(120px,max-content)_1fr] gap-x-3 gap-y-1 text-xs">
      {entries.map(([field, [before, after]]) => (
        <div key={field} className="contents">
          <div className="text-secondary-text">{fieldLabel(t, field)}</div>
          <div className="break-all">
            {action === "INSERT" ? (
              <span className="text-text">{display(after, label(field, after))}</span>
            ) : action === "DELETE" ? (
              <span className="text-red-500 line-through">{display(before, label(field, before))}</span>
            ) : (
              <>
                <span className="text-red-500 line-through">{display(before, label(field, before))}</span>
                <span className="mx-1.5 text-secondary-text">→</span>
                <span className="text-green-600">{display(after, label(field, after))}</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
