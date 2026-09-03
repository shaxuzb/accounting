import type { ReactNode } from "react";
import Card from "@/components/ui/card/Card";
import type { SourceStatus } from "../types/type";
import SourceStatusBadge from "./SourceStatusBadge";

interface DashboardSectionProps {
  title: string;
  description?: string;
  icon: ReactNode;
  status?: SourceStatus;
  extra?: ReactNode;
  children: ReactNode;
}

export default function DashboardSection({
  title,
  description,
  icon,
  status,
  extra,
  children,
}: DashboardSectionProps) {
  return (
    <Card className="overflow-hidden border border-border shadow-(--theme-shadow)">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-(--theme-brand)">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-heading">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-(--theme-text-secondary)">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status ? <SourceStatusBadge status={status} /> : null}
          {extra}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}
