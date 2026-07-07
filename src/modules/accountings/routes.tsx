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
  AccountingPeriodsPage,
  AuditLogPage,
  BalanceSheetPage,
  CashFlowPage,
  IncomeStatementPage,
  JournalPage,
  LedgerPage,
  RepostPage,
  TrialBalancePage,
} from "./pages";

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
      index: true,
      element: <Navigate to="reports/balance-sheet" replace />,
    },
    {
      path: "register-entries",
      handle: { title: "Accounting entries" },
      children: [
        // {
        //   index: true,
        //   element: withAccess(
        //     <AccountingRegisterEntriesPage />,
        //     accountingRegisterEntriesPermissions.view,
        //   ),
        // },
        // {
        //   path: "daily",
        //   element: withAccess(
        //     <AccountingRegisterEntriesDailyPage />,
        //     accountingRegisterEntriesPermissions.view,
        //   ),
        //   handle: {
        //     title: "Accounting entries daily",
        //     showBack: true,
        //     backTo: "..",
        //   },
        // },
      ],
    },
    {
      path: "reports",
      handle: { title: "Accounting reports" },
      element: withAccess(<Outlet />, accountingReportPermissions.view),
      children: [
        {
          index: true,
          element: <Navigate to="balance-sheet" replace />,
        },
        {
          path: "balance-sheet",
          handle: { title: "Balance sheet" },
          element: withAccess(<BalanceSheetPage />, accountingReportPermissions.view),
        },
        {
          path: "income-statement",
          handle: { title: "Income statement" },
          element: withAccess(
            <IncomeStatementPage />,
            accountingReportPermissions.view,
          ),
        },
        {
          path: "cash-flow",
          handle: { title: "Cash flow" },
          element: withAccess(<CashFlowPage />, accountingReportPermissions.view),
        },
        {
          path: "account-turnover",
          handle: { title: "Account turnover" },
          element: withAccess(
            <AccountTurnoverPage />,
            accountingReportPermissions.view,
          ),
        },
        {
          path: "journal",
          handle: { title: "Journal" },
          element: withAccess(<JournalPage />, accountingReportPermissions.view),
        },
        {
          path: "account-card",
          handle: { title: "Account card" },
          element: withAccess(<AccountCardPage />, accountingReportPermissions.view),
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
        accountingPeriodsPermissions.update,
      ),
    },
    {
      path: "*",
      element: <Navigate to="." replace />,
    },
  ],
};
