import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RelationshipsSummary, RelationshipSide } from "../types/type";
import {
  formatDashboardCount,
  getDashboardDocumentStatusLabel,
} from "../utils/dashboard";
import DashboardSection from "./DashboardSection";

function Side({
  side,
  label,
  icon,
}: {
  side: RelationshipSide;
  label: string;
  icon: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-border bg-(--theme-bg-card) p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-heading">
          {icon}
          {label}
        </span>
        <span className="text-2xl font-semibold leading-none text-heading">
          {formatDashboardCount(side.total)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {side.statusCounts.length ? (
          side.statusCounts.map((item) => (
            <span
              key={item.status}
              className="rounded-full bg-(--theme-bg-muted) px-2.5 py-1 text-xs text-(--theme-text-secondary)"
            >
              {t(
                `dashboard.documents.statusLabels.${item.status.toUpperCase()}`,
                {
                  defaultValue: getDashboardDocumentStatusLabel(item.status),
                },
              )}
              :{" "}
              <strong className="text-heading">
                {formatDashboardCount(item.count)}
              </strong>
            </span>
          ))
        ) : (
          <span className="text-xs text-(--theme-text-secondary)">—</span>
        )}
      </div>
    </div>
  );
}

export default function RelationshipsWidget({
  summary,
}: {
  summary: RelationshipsSummary;
}) {
  const { t } = useTranslation();

  return (
    <DashboardSection
      title={t("dashboard.relationships.title")}
      description={t("dashboard.relationships.description")}
      icon={<Users className="size-5" />}
      status={summary.sourceStatus}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Side
          side={summary.incoming}
          label={t("dashboard.relationships.incoming")}
          icon={<ArrowDownLeft className="size-4 text-blue-600" />}
        />
        <Side
          side={summary.outgoing}
          label={t("dashboard.relationships.outgoing")}
          icon={<ArrowUpRight className="size-4 text-emerald-600" />}
        />
      </div>
    </DashboardSection>
  );
}
