import type { ReactNode } from "react";

export interface ReadonlyDetailsCardItem {
  label: string;
  value?: ReactNode;
  className?: string;
}

interface ReadonlyDetailsCardProps {
  items: ReadonlyDetailsCardItem[];
  className?: string;
}

export default function ReadonlyDetailsCard({
  items,
  className = "",
}: ReadonlyDetailsCardProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={`rounded-lg border border-border/60 bg-background/60 p-3 ${item.className ?? ""}`}
        >
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className="mt-1 font-medium">{item.value ?? "-"}</div>
        </div>
      ))}
    </div>
  );
}
