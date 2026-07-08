import { NavLink } from "react-router";

const tabs = [
  { to: "balance-sheet", label: "Balance sheet" },
  { to: "income-statement", label: "Income statement" },
  { to: "cash-flow", label: "Cash flow" },
  { to: "account-turnover", label: "Account turnover" },
  { to: "journal", label: "Journal" },
  { to: "account-card", label: "Account card" },
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
