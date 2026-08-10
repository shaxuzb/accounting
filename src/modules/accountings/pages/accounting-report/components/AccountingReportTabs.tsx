import { Tabs } from "antd";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const tabs = [
  { key: "balance-sheet", labelKey: "app.reports.balance.title" },
  { key: "income-statement", labelKey: "app.reports.income.title" },
  { key: "cash-flow", labelKey: "app.reports.cashFlow.title" },
  {
    key: "account-turnover",
    labelKey: "app.reports.turnover.title",
  },
  { key: "journal", labelKey: "app.reports.journal.title" },
  { key: "account-card", labelKey: "app.reports.card.title" },
];

export default function AccountingReportTabs() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey =
    tabs.find((tab) => location.pathname.endsWith(`/${tab.key}`))?.key ??
    tabs[0].key;
  const reportsPath = location.pathname.replace(/\/[^/]+\/?$/, "");

  return (
    <Tabs
      type="card"
      activeKey={activeKey}
      onChange={(key) => navigate(`${reportsPath}/${key}`)}
      items={tabs.map((tab) => ({
        key: tab.key,
        label: t(tab.labelKey),
      }))}
      className="[&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:rounded-xl  [&_.ant-tabs-nav]:border-border [&_.ant-tabs-nav]:bg-card [&_.ant-tabs-nav]:p-2 [&_.ant-tabs-nav]:before:border-0! [&_.ant-tabs-tab]:rounded-lg! [&_.ant-tabs-tab]:border-0! [&_.ant-tabs-tab]:bg-transparent! [&_.ant-tabs-tab]:px-3! [&_.ant-tabs-tab]:py-2! [&_.ant-tabs-tab-btn]:text-secondary-text [&_.ant-tabs-tab-active]:bg-brand! [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-on-brand!"
    />
  );
}
