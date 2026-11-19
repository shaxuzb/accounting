import { BadgePercent, Landmark, ShoppingCart, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TaxSummary } from "../types/type";
import {
  formatDashboardAmount,
  formatDashboardCount,
} from "../utils/dashboard";
import DashboardSection from "./DashboardSection";
import MetricCard from "./MetricCard";

/**
 * VAT of the period from the ledger: charged on sales (Kt 6410), recoverable on purchases (Dt 4410)
 * and their difference — payable to the budget, or an excess carried to the next period.
 */
export default function TaxSummaryWidget({ summary }: { summary: TaxSummary }) {
  const { t } = useTranslation();
  const sale = summary.items.find((item) => item.documentType === "SALE");
  const purchase = summary.items.find((item) => item.documentType === "PURCHASE");
  const payable = summary.total;

  const documents = (count?: number) =>
    t("dashboard.tax.documentCount", { count: formatDashboardCount(count ?? 0) });

  const description =
    summary.isVatPayer === false
      ? t("dashboard.tax.notVatPayer")
      : t("dashboard.tax.description");

  return (
    <DashboardSection
      title={t("dashboard.tax.title")}
      description={description}
      icon={<BadgePercent className="size-5" />}
      status={summary.sourceStatus}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={t("dashboard.tax.saleVat")}
          value={formatDashboardAmount(sale?.vatAmount ?? 0, "UZS")}
          hint={documents(sale?.count)}
          icon={<Store className="size-4" />}
          tone="blue"
        />
        <MetricCard
          label={t("dashboard.tax.purchaseVat")}
          value={formatDashboardAmount(purchase?.vatAmount ?? 0, "UZS")}
          hint={documents(purchase?.count)}
          icon={<ShoppingCart className="size-4" />}
          tone="purple"
        />
        <MetricCard
          label={
            payable >= 0 ? t("dashboard.tax.payable") : t("dashboard.tax.excess")
          }
          value={formatDashboardAmount(Math.abs(payable), "UZS")}
          hint={
            payable >= 0
              ? t("dashboard.tax.payableHint")
              : t("dashboard.tax.excessHint")
          }
          icon={<Landmark className="size-4" />}
          tone={payable > 0 ? "red" : "green"}
        />
      </div>
    </DashboardSection>
  );
}
