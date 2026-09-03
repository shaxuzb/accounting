import type { ReactNode } from "react";

export interface ReadonlyFieldItem {
  label: string;
  value: ReactNode;
  className?: string;
}

interface ReadonlyFieldGridProps {
  items: ReadonlyFieldItem[];
  columns?: string;
}

export default function ReadonlyFieldGrid({
  items,
  columns = "md:grid-cols-2 xl:grid-cols-4",
}: ReadonlyFieldGridProps) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`min-w-0 rounded-lg border border-border bg-surface-muted px-3 py-2.5 ${item.className ?? ""}`}
        >
          <div className="text-xs text-secondary-text">{item.label}</div>
          <div className="mt-1 text-sm font-semibold text-text">
            {item.value ?? "-"}
          </div>
        </div>
      ))}
    </div>
  );
}
