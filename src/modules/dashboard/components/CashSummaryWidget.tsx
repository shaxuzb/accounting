import { Empty, Table } from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { CashItem, CashSummary } from "../types/type";
import { formatDashboardAmount } from "../utils/dashboard";
import DashboardSection from "./DashboardSection";
import MetricCard from "./MetricCard";

export default function CashSummaryWidget({
  summary,
}: {
  summary: CashSummary;
}) {
  const { t } = useTranslation();
  const currencyCodes = [
    ...new Set(summary.items.map((item) => item.currencyCode).filter(Boolean)),
  ];
  const currencyCode = currencyCodes.length === 1 ? currencyCodes[0] : "";
  const format = (value: number) => formatDashboardAmount(value, currencyCode);

  const columns: TableColumnsType<CashItem> = [
    {
      title: t("dashboard.cash.account"),
      dataIndex: "accountName",
      render: (value: string, item) => (
        <div>
          <p className="font-medium text-heading">
            {value || t("dashboard.cash.unnamedAccount")}
          </p>
          <p className="text-xs text-(--theme-text-secondary)">
            {item.sourceType === "CASH_BOX"
              ? t("dashboard.cash.cashBox")
              : t("dashboard.cash.bankAccount")}
            {" · "}
            {item.currencyCode}
          </p>
        </div>
      ),
    },
    {
      title: t("dashboard.cash.opening"),
      dataIndex: "openingBalance",
      align: "right",
      render: (value: number) => format(value),
    },
    {
      title: t("dashboard.cash.inflow"),
      dataIndex: "inflow",
      align: "right",
      render: (value: number) => (
        <span className="text-emerald-600">{format(value)}</span>
      ),
    },
    {
      title: t("dashboard.cash.outflow"),
      dataIndex: "outflow",
      align: "right",
      render: (value: number) => (
        <span className="text-rose-600">{format(value)}</span>
      ),
    },
    {
      title: t("dashboard.cash.closing"),
      dataIndex: "closingBalance",
      align: "right",
      render: (value: number) => (
        <span className="font-semibold text-violet-600">{format(value)}</span>
      ),
    },
  ];

  return (
    <DashboardSection
      title={t("dashboard.cash.title")}
      description={t("dashboard.cash.description")}
      icon={<Wallet className="size-5" />}
      status={summary.sourceStatus}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("dashboard.cash.opening")}
          value={format(summary.totals.openingBalance)}
          icon={<Landmark className="size-4" />}
          tone="blue"
        />
        <MetricCard
          label={t("dashboard.cash.inflow")}
          value={format(summary.totals.inflow)}
          icon={<ArrowDownToLine className="size-4" />}
          tone="green"
        />
        <MetricCard
          label={t("dashboard.cash.outflow")}
          value={format(summary.totals.outflow)}
          icon={<ArrowUpFromLine className="size-4" />}
          tone="red"
        />
        <MetricCard
          label={t("dashboard.cash.closing")}
          value={format(summary.totals.closingBalance)}
          icon={<Wallet className="size-4" />}
          tone="purple"
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        {summary.items.length ? (
          <Table<CashItem>
            rowKey={(item) =>
              item.sourceType + "-" + item.accountId + "-" + item.currencyId
            }
            columns={columns}
            dataSource={summary.items}
            pagination={false}
            scroll={{ x: 760 }}
          />
        ) : (
          <div className="px-4 py-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("dashboard.cash.empty")}
            />
          </div>
        )}
      </div>
    </DashboardSection>
  );
}
