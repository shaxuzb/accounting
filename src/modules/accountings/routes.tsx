import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Navigate, Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { ledgerPermissions } from "./pages/ledger/constants/permissions";
import { trialBalancePermissions } from "./pages/trial-balance/constants/permissions";
import { auditLogPermissions } from "./pages/audit-log/constants/permissions";
import { repostPermissions } from "./pages/repost/constants/permissions";
import { accountingReportPermissions } from "./pages/accounting-report/constants/permissions";
import {
  AccountCardPage,
  AccountTurnoverPage,
  BalanceSheetPage,
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
  handle: { title: "app.accounting.title" },
  children: [
    {
      path: "reports",
      handle: { title: "app.accounting.reports" },
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <Navigate to="balance-sheet" replace />,
        },
        {
          path: "balance-sheet",
          handle: { title: "app.accounting.balanceSheet" },
          element: withAccess(
            <BalanceSheetPage />,
            accountingReportPermissions.balanceSheet,
          ),
        },
        {
          path: "income-statement",
          handle: { title: "app.accounting.incomeStatement" },
          element: withAccess(
            <IncomeStatementPage />,
            accountingReportPermissions.incomeStatement,
          ),
        },
        {
          path: "cash-flow",
          handle: { title: "app.accounting.cashFlow" },
          element: withAccess(
            <CashFlowPage />,
            accountingReportPermissions.cashFlow,
          ),
        },
        {
          path: "account-turnover",
          handle: { title: "app.accounting.accountTurnover" },
          element: withAccess(
            <AccountTurnoverPage />,
            accountingReportPermissions.accountTurnover,
          ),
        },
        {
          path: "journal",
          handle: { title: "app.accounting.journal" },
          element: withAccess(
            <JournalPage />,
            accountingReportPermissions.journal,
          ),
        },
        {
          path: "account-card",
          handle: { title: "app.accounting.accountCard" },
          element: withAccess(
            <AccountCardPage />,
            accountingReportPermissions.accountCard,
          ),
        },
      ],
    },
    {
      path: "ledger",
      handle: { title: "app.accounting.ledger" },
      element: withAccess(<LedgerPage />, ledgerPermissions.view),
    },
    {
      path: "trial-balance",
      handle: { title: "app.accounting.trialBalance" },
      element: withAccess(<TrialBalancePage />, trialBalancePermissions.view),
    },
    {
      path: "audit-log",
      handle: { title: "app.accounting.auditLog" },
      element: withAccess(<AuditLogPage />, auditLogPermissions.view),
    },
    {
      path: "repost",
      handle: { title: "app.accounting.repost" },
      element: withAccess(<RepostPage />, repostPermissions.update),
    },
    {
      path: "*",
      element: <Navigate to="." replace />,
    },
  ],
};
