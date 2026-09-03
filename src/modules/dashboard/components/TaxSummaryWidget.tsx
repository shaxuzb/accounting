import { BadgePercent, CheckCircle2, CircleHelp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TaxSummary } from "../types/type";
import {
  formatDashboardAmount,
  formatDashboardCount,
} from "../utils/dashboard";
import DashboardSection from "./DashboardSection";
import MetricCard from "./MetricCard";

export default function TaxSummaryWidget({ summary }: { summary: TaxSummary }) {
  const { t } = useTranslation();

  return (
    <DashboardSection
      title={t("dashboard.tax.title")}
      description={t("dashboard.tax.description")}
      icon={<BadgePercent className="size-5" />}
      status={summary.sourceStatus}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard
          label={t("dashboard.tax.total")}
          value={formatDashboardAmount(summary.total, "")}
          icon={<BadgePercent className="size-4" />}
          tone="purple"
        />
        <div className="rounded-xl border border-border bg-(--theme-bg-muted) p-4">
          <span className="text-sm text-(--theme-text-secondary)">
            {t("dashboard.tax.vatPayer")}
          </span>
          <div className="mt-3 flex items-center gap-2 text-xl font-semibold text-heading">
            {summary.isVatPayer === null ? (
              <CircleHelp className="size-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="size-5 text-emerald-500" />
            )}
            {summary.isVatPayer === null
              ? t("dashboard.notAvailable")
              : summary.isVatPayer
                ? t("dashboard.tax.yes")
                : t("dashboard.tax.no")}
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {summary.items.length ? (
          summary.items.map((item) => (
            <div
              key={item.documentType + "-" + item.currencyId}
              className="flex items-center justify-between gap-3 rounded-lg bg-(--theme-bg-muted) px-3 py-2.5 text-sm"
            >
              <span className="text-(--theme-text-secondary)">
                {item.documentType || "—"} · {formatDashboardCount(item.count)}{" "}
                ta
              </span>
              <span className="font-medium text-heading">
                {formatDashboardAmount(item.vatAmount, "")}
              </span>
            </div>
          ))
        ) : (
          <p className="py-3 text-center text-sm text-(--theme-text-secondary)">
            {t("dashboard.tax.empty")}
          </p>
        )}
      </div>
    </DashboardSection>
  );
}
