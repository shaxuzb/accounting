import type { ReactNode } from "react";
import { formatStructuredData } from "./structuredData";

interface Props {
  value: unknown;
  className?: string;
  empty?: ReactNode;
  fallbackLabel?: string;
  itemClassName?: string;
  labelClassName?: string;
}

export default function StructuredDataView({
  value,
  className = "",
  empty = "-",
  fallbackLabel,
  itemClassName = "min-w-0 wrap-break-words",
  labelClassName = "text-secondary-text",
}: Props) {
  const entries = formatStructuredData(value);
  if (!entries.length) return <>{empty}</>;

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      {entries.map((entry, index) => {
        const label = (entry.label || fallbackLabel)
          ?.trim()
          .replace(/:+$/, "");

        return (
          <div
            key={`${entry.label}-${entry.value}-${index}`}
            className={itemClassName}
          >
            {label && (
              <span className={`mr-1 ${labelClassName}`}>{label}:</span>
            )}
            <span className="font-medium text-text">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}
