import type { ReactNode } from "react";
import { formatStructuredData } from "./structuredData";

interface Props {
  value: unknown;
  className?: string;
  empty?: ReactNode;
}

export default function StructuredDataView({
  value,
  className = "",
  empty = "-",
}: Props) {
  const entries = formatStructuredData(value);
  if (!entries.length) return <>{empty}</>;

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      {entries.map((entry, index) => (
        <div
          key={`${entry.label}-${entry.value}-${index}`}
          className="min-w-0 wrap-break-words"
        >
          {entry.label && (
            <span className="mr-1 text-secondary-text">{entry.label}:</span>
          )}
          <span className="font-medium text-text">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
