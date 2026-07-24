import type { ReactNode } from "react";
import Card from "@/components/ui/card/Card";

interface SummaryItem {
  label: string;
  value: ReactNode;
  tone?: "default" | "primary" | "success" | "danger";
}

interface Props {
  items: SummaryItem[];
}

const toneClass: Record<NonNullable<SummaryItem["tone"]>, string> = {
  default: "text-text",
  primary: "text-brand-text",
  success: "text-success",
  danger: "text-danger",
};

export default function AccountingReportSummaryGrid({ items }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border border-border p-4">
          <div className="text-xs text-secondary-text">{item.label}</div>
          <div className={`mt-1 text-lg font-semibold ${toneClass[item.tone ?? "default"]}`}>
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
