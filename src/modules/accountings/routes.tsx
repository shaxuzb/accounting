import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Navigate, Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { ledgerPermissions } from "./pages/ledger/constants/permissions";
import { trialBalancePermissions } from "./pages/trial-balance/constants/permissions";
import { auditLogPermissions } from "./pages/audit-log/constants/permissions";
import { repostPermissions } from "./pages/repost/constants/permissions";
import { accountingPeriodsPermissions } from "./pages/accounting-periods/constants/permissions";
import { accountingReportPermissions } from "./pages/accounting-report/constants/permissions";
import {
  AccountCardPage,
  AccountTurnoverPage,
  BalanceSheetPage,
  AccountingPeriodsPage,
  AuditLogPage,
  CashFlowPage,
  IncomeStatementPage,
  JournalPage,
  LedgerPage,
  RepostPage,
} from "./pages";
import TrialBalancePage from "./pages/trial-balance/screens/TrialBalancePage";

const withAccess = (element: ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const accountingsRoutes: RouteObject = {
  path: "accountings",
  element: <Outlet />,
  handle: { title: "Accounting" },
  children: [
    {
      path: "reports",
      handle: { title: "Accounting reports" },
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Navigate to="balance-sheet" replace />,
        },
        {
          path: "balance-sheet",
          handle: { title: "Balance sheet" },
          element: withAccess(
            <BalanceSheetPage />,
            accountingReportPermissions.balanceSheet,
          ),
        },
        {
          path: "income-statement",
          handle: { title: "Income statement" },
          element: withAccess(
            <IncomeStatementPage />,
            accountingReportPermissions.incomeStatement,
          ),
        },
        {
          path: "cash-flow",
          handle: { title: "Cash flow" },
          element: withAccess(
            <CashFlowPage />,
            accountingReportPermissions.cashFlow,
          ),
        },
        {
          path: "account-turnover",
          handle: { title: "Account turnover" },
          element: withAccess(
            <AccountTurnoverPage />,
            accountingReportPermissions.accountTurnover,
          ),
        },
        {
          path: "journal",
          handle: { title: "Journal" },
          element: withAccess(
            <JournalPage />,
            accountingReportPermissions.journal,
          ),
        },
        {
          path: "account-card",
          handle: { title: "Account card" },
          element: withAccess(
            <AccountCardPage />,
            accountingReportPermissions.accountCard,
          ),
        },
      ],
    },
    {
      path: "ledger",
      handle: { title: "Ledger" },
      element: withAccess(<LedgerPage />, ledgerPermissions.view),
    },
    {
      path: "trial-balance",
      handle: { title: "Trial balance" },
      element: withAccess(<TrialBalancePage />, trialBalancePermissions.view),
    },
    {
      path: "audit-log",
      handle: { title: "Audit log" },
      element: withAccess(<AuditLogPage />, auditLogPermissions.view),
    },
    {
      path: "repost",
      handle: { title: "Repost" },
      element: withAccess(<RepostPage />, repostPermissions.update),
    },
    {
      path: "accounting-periods",
      handle: { title: "Accounting periods" },
      element: withAccess(
        <AccountingPeriodsPage />,
        accountingPeriodsPermissions.close,
      ),
    },
    {
      path: "*",
      element: <Navigate to="." replace />,
    },
  ],
};
