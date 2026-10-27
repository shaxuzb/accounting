import { Tabs } from "antd";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { accountingReportPermissions as p } from "../constants/permissions";

// each report with the permission its route asks for: a tab the user may not open is not shown
const tabs = [
  { key: "form-1", labelKey: "app.regulatedForms.form1", permission: p.balanceSheet },
  { key: "form-2", labelKey: "app.regulatedForms.form2", permission: p.incomeStatement },
  { key: "form-4", labelKey: "app.regulatedForms.form4", permission: p.cashFlow },
  { key: "express-check", labelKey: "app.regulatedForms.expressCheck", permission: p.balanceSheet },
  { key: "balance-sheet", labelKey: "app.reports.balance.title", permission: p.balanceSheet },
  { key: "income-statement", labelKey: "app.reports.income.title", permission: p.incomeStatement },
  { key: "cash-flow", labelKey: "app.reports.cashFlow.title", permission: p.cashFlow },
  { key: "account-turnover", labelKey: "app.reports.turnover.title", permission: p.accountTurnover },
  { key: "journal", labelKey: "app.reports.journal.title", permission: p.journal },
  { key: "account-card", labelKey: "app.reports.card.title", permission: p.accountCard },
  { key: "analysis", labelKey: "app.analyticReports.title", permission: p.accountTurnover },
];

/** The first report the user may open: the reports' menu item opens it. */
export function FirstAllowedReport() {
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions);
  const first = ["balance-sheet", ...tabs.map((tab) => tab.key)]
    .map((key) => tabs.find((tab) => tab.key === key)!)
    .find((tab) => !permissions || permissions.includes(tab.permission));
  return <Navigate to={first?.key ?? "balance-sheet"} replace />;
}

export default function AccountingReportTabs() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions);
  const visible = permissions ? tabs.filter((tab) => permissions.includes(tab.permission)) : tabs;
  const activeKey =
    tabs.find((tab) => location.pathname.endsWith(`/${tab.key}`))?.key ??
    tabs[0].key;
  const reportsPath = location.pathname.replace(/\/[^/]+\/?$/, "");

  return (
    <Tabs
      type="card"
      activeKey={activeKey}
      onChange={(key) => navigate(`${reportsPath}/${key}`)}
      items={visible.map((tab) => ({
        key: tab.key,
        label: t(tab.labelKey),
      }))}
      className="[&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:rounded-xl  [&_.ant-tabs-nav]:border-border [&_.ant-tabs-nav]:bg-card [&_.ant-tabs-nav]:p-2 [&_.ant-tabs-nav]:before:border-0! [&_.ant-tabs-tab]:rounded-lg! [&_.ant-tabs-tab]:border-0! [&_.ant-tabs-tab]:bg-transparent! [&_.ant-tabs-tab]:px-3! [&_.ant-tabs-tab]:py-2! [&_.ant-tabs-tab-btn]:text-secondary-text [&_.ant-tabs-tab-active]:bg-brand! [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-on-brand!"
    />
  );
}
