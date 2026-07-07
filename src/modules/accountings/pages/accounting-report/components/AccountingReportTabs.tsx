import { NavLink } from "react-router";

const tabs = [
  { to: "/main/accountings/reports/balance-sheet", label: "Balance sheet" },
  { to: "/main/accountings/reports/income-statement", label: "Income statement" },
  { to: "/main/accountings/reports/cash-flow", label: "Cash flow" },
  { to: "/main/accountings/reports/account-turnover", label: "Account turnover" },
  { to: "/main/accountings/reports/journal", label: "Journal" },
  { to: "/main/accountings/reports/account-card", label: "Account card" },
];

export default function AccountingReportTabs() {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-primary text-white"
                : "bg-transparent text-secondary-text hover:bg-muted hover:text-text"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
