import type { ReactNode } from "react";

interface DocumentSummaryProps {
  children: ReactNode;
  className?: string;
}

export function DocumentSummary({
  children,
  className = "",
}: DocumentSummaryProps) {
  return (
    <section
      className={`grid overflow-hidden rounded-lg border border-border bg-primary-bg shadow-sm sm:grid-cols-2 lg:grid-cols-5 ${className}`}
    >
      {children}
    </section>
  );
}

interface DocumentSummaryItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  emphasized?: boolean;
  iconClassName?: string;
}

export function DocumentSummaryItem({
  icon,
  label,
  value,
  emphasized,
  iconClassName = "text-primary",
}: DocumentSummaryItemProps) {
  return (
    <div className="flex min-h-20 min-w-0 items-center gap-3 border-b border-border px-5 py-3 last:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0">
      <div className={`shrink-0 ${iconClassName}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-secondary-text">{label}</div>
        <div
          className={`mt-0.5 truncate text-sm font-semibold ${
            emphasized ? "text-primary" : "text-text"
          }`}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
