import type { ReactNode } from "react";
import Card from "@/components/ui/card/Card";

interface SummaryItem {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  helper?: ReactNode;
  tone?: "default" | "primary" | "success" | "danger" | "warning" | "violet";
}

interface Props {
  items: SummaryItem[];
  columns?: 2 | 3 | 4;
  /** Kartochkalar balandligini kamaytiradi (ichki padding kichrayadi). */
  compact?: boolean;
}

const toneClass: Record<NonNullable<SummaryItem["tone"]>, string> = {
  default: "text-text",
  primary: "text-brand-text",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  violet: "text-violet-600",
};

const iconToneClass: Record<NonNullable<SummaryItem["tone"]>, string> = {
  default: "bg-surface-muted text-secondary-text",
  primary: "bg-brand-soft text-brand-text",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  violet: "bg-violet-50 text-violet-600",
};

const gridClass = {
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
};

export default function AccountingReportSummaryGrid({
  items,
  columns = 4,
  compact = false,
}: Props) {
  const cardPadding = compact ? "px-4 py-2.5" : "p-4";
  const iconSize = compact ? "size-8" : "size-9";
  const valueGap = compact ? "mt-0.5" : "mt-1";
  const helperGap = compact ? "mt-0" : "mt-1";

  return (
    <div className={`grid gap-3 md:grid-cols-2 ${gridClass[columns]}`}>
      {items.map((item) => {
        const tone = item.tone ?? "default";

        return (
          <Card
            key={item.label}
            className={`border border-border ${cardPadding} shadow-sm`}
          >
            <div className="flex items-start gap-3">
              {item.icon && (
                <span
                  className={`flex ${iconSize} shrink-0 items-center justify-center rounded-full ${iconToneClass[tone]}`}
                >
                  {item.icon}
                </span>
              )}
              <div className="min-w-0">
                <div className="text-xs text-secondary-text">{item.label}</div>
                <div
                  className={`${valueGap} truncate text-lg font-semibold tabular-nums ${toneClass[tone]}`}
                  title={typeof item.value === "string" ? item.value : undefined}
                >
                  {item.value}
                </div>
                {item.helper && (
                  <div className={`${helperGap} text-xs text-secondary-text`}>
                    {item.helper}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
