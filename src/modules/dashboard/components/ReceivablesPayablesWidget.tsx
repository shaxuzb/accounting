import { AlertCircle, HandCoins } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DebtSummary } from "../types/type";
import { formatDashboardAmount, isUnavailableAmount } from "../utils/dashboard";
import DashboardSection from "./DashboardSection";

function DebtColumn({
  debt,
  title,
  tone,
}: {
  debt: DebtSummary;
  title: string;
  tone: "blue" | "red";
}) {
  const { t } = useTranslation();
  const currencyCode = "";
  const color = tone === "blue" ? "text-blue-600" : "text-rose-600";

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className={"flex items-center gap-2 font-semibold " + color}>
          {title}
        </h3>
        <span className="text-lg font-semibold text-heading">
          {formatDashboardAmount(debt.current, currencyCode)}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-(--theme-text-secondary)">
        <AlertCircle className="size-3.5" />
        {isUnavailableAmount(debt.overdue)
          ? t("dashboard.debts.overdueUnavailable")
          : t("dashboard.debts.overdue", {
              amount: formatDashboardAmount(debt.overdue, currencyCode),
            })}
      </div>
      <div className="mt-4 space-y-2">
        {debt.counterparties.slice(0, 5).map((item) => (
          <div
            key={item.counterpartyId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="truncate text-(--theme-text-secondary)">
              {item.counterpartyName ||
                t("dashboard.debts.unknownCounterparty")}
            </span>
            <span className="shrink-0 font-medium text-heading">
              {formatDashboardAmount(item.currentAmount, currencyCode)}
            </span>
          </div>
        ))}
        {!debt.counterparties.length ? (
          <p className="py-3 text-center text-sm text-(--theme-text-secondary)">
            {t("dashboard.debts.empty")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function ReceivablesPayablesWidget({
  receivables,
  payables,
}: {
  receivables: DebtSummary;
  payables: DebtSummary;
}) {
  const { t } = useTranslation();

  return (
    <DashboardSection
      title={t("dashboard.debts.title")}
      description={t("dashboard.debts.description")}
      icon={<HandCoins className="size-5" />}
      status={
        receivables.sourceStatus === "AVAILABLE" &&
        payables.sourceStatus === "AVAILABLE"
          ? "AVAILABLE"
          : "PARTIAL"
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <DebtColumn
          debt={receivables}
          title={t("dashboard.debts.receivable")}
          tone="blue"
        />
        <DebtColumn
          debt={payables}
          title={t("dashboard.debts.payable")}
          tone="red"
        />
      </div>
    </DashboardSection>
  );
}
