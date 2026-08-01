import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

const tabs = [
  { to: "../balance-sheet", labelKey: "app.reports.balance.title" },
  { to: "../income-statement", labelKey: "app.reports.income.title" },
  { to: "../cash-flow", labelKey: "app.reports.cashFlow.title" },
  {
    to: "../account-turnover",
    labelKey: "app.reports.turnover.title",
  },
  { to: "../journal", labelKey: "app.reports.journal.title" },
  { to: "../account-card", labelKey: "app.reports.card.title" },
];

export default function AccountingReportTabs() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-brand text-on-brand"
                : "bg-transparent text-secondary-text hover:bg-surface-hover hover:text-text"
            }`
          }
        >
          {t(tab.labelKey)}
        </NavLink>
      ))}
    </div>
  );
}
