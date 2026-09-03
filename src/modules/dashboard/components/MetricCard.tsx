import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone: "blue" | "green" | "red" | "purple";
}

const toneClasses = {
  blue: "border-blue-200/80 bg-blue-50/70 dark:border-blue-900/80 dark:bg-blue-950/30",
  green:
    "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/80 dark:bg-emerald-950/30",
  red: "border-rose-200/80 bg-rose-50/70 dark:border-rose-900/80 dark:bg-rose-950/30",
  purple:
    "border-violet-200/80 bg-violet-50/70 dark:border-violet-900/80 dark:bg-violet-950/30",
} as const;

const valueClasses = {
  blue: "text-blue-700 dark:text-blue-300",
  green: "text-emerald-700 dark:text-emerald-300",
  red: "text-rose-700 dark:text-rose-300",
  purple: "text-violet-700 dark:text-violet-300",
} as const;

export default function MetricCard({
  label,
  value,
  hint,
  icon,
  tone,
}: MetricCardProps) {
  return (
    <div className={"rounded-xl border p-4 " + toneClasses[tone]}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-(--theme-text-secondary)">
          {label}
        </span>
        <span className="text-(--theme-brand)">{icon}</span>
      </div>
      <div
        className={
          "mt-3 text-xl font-semibold tracking-tight " + valueClasses[tone]
        }
      >
        {value}
      </div>
      {hint ? (
        <p className="mt-1 text-xs text-(--theme-text-secondary)">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
