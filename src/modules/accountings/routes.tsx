import { lazy } from "react";
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
  currencyRatePermissions,
  currencyRevaluationPermissions,
} from "./pages/currency/constants";
const AccountCardPage = lazy(() => import("./pages").then((m) => ({ default: m.AccountCardPage })));
const AccountTurnoverPage = lazy(() => import("./pages").then((m) => ({ default: m.AccountTurnoverPage })));
const BalanceSheetPage = lazy(() => import("./pages").then((m) => ({ default: m.BalanceSheetPage })));
const AuditLogPage = lazy(() => import("./pages").then((m) => ({ default: m.AuditLogPage })));
const CashFlowPage = lazy(() => import("./pages").then((m) => ({ default: m.CashFlowPage })));
const IncomeStatementPage = lazy(() => import("./pages").then((m) => ({ default: m.IncomeStatementPage })));
const JournalPage = lazy(() => import("./pages").then((m) => ({ default: m.JournalPage })));
const LedgerPage = lazy(() => import("./pages").then((m) => ({ default: m.LedgerPage })));
const RepostPage = lazy(() => import("./pages").then((m) => ({ default: m.RepostPage })));
const TrialBalancePage = lazy(() => import("./pages/trial-balance/screens/TrialBalancePage"));
const RegulatedBalancePage = lazy(() => import("./pages/regulated-forms/RegulatedBalancePage"));
const RegulatedResultsPage = lazy(() => import("./pages/regulated-forms/RegulatedResultsPage"));
const ExpressCheckPage = lazy(() => import("./pages/regulated-forms/ExpressCheckPage"));
const RegulatedCashFlowPage = lazy(() => import("./pages/regulated-forms/RegulatedCashFlowPage"));
const AnalyticReportsPage = lazy(() => import("./pages/analytic-reports/AnalyticReportsPage"));
const DocumentJournalPage = lazy(() => import("./pages/document-journal/DocumentJournalPage"));
const VatReturnPage = lazy(() => import("./pages/tax-reports/TaxFormPages").then((m) => ({ default: m.VatReturnPage })));
const TurnoverTaxPage = lazy(() => import("./pages/tax-reports/TaxFormPages").then((m) => ({ default: m.TurnoverTaxPage })));
const ProfitTaxPage = lazy(() => import("./pages/tax-reports/TaxFormPages").then((m) => ({ default: m.ProfitTaxPage })));
const PayrollTaxReturnPage = lazy(() => import("./pages/tax-reports/TaxFormPages").then((m) => ({ default: m.PayrollTaxReturnPage })));
const VatRegisterPage = lazy(() => import("./pages/tax-reports/VatRegisterPage"));
const PropertyTaxPage = lazy(() => import("./pages/tax-reports/PropertyTaxPage"));
const ManualEntriesPage = lazy(() => import("./pages/manual-entries/ManualEntriesPage"));
const ManualEntryEditorPage = lazy(() => import("./pages/manual-entries/ManualEntryEditorPage"));
const PeriodsPage = lazy(() => import("./pages/periods/PeriodsPage"));
const DeferredExpensesPage = lazy(() => import("./pages/deferred-expenses/DeferredExpensesPage"));
const CurrencyRatesPage = lazy(() => import("./pages/currency/screens/CurrencyRatesPage"));
const CurrencyRevaluationPage = lazy(() => import("./pages/currency/screens/CurrencyRevaluationPage"));

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
          path: "form-1",
          handle: { title: "app.regulatedForms.form1" },
          element: withAccess(<RegulatedBalancePage />, accountingReportPermissions.balanceSheet),
        },
        {
          path: "form-2",
          handle: { title: "app.regulatedForms.form2" },
          element: withAccess(<RegulatedResultsPage />, accountingReportPermissions.incomeStatement),
        },
        {
          path: "analysis",
          handle: { title: "app.analyticReports.title" },
          element: withAccess(<AnalyticReportsPage />, accountingReportPermissions.accountTurnover),
        },
        {
          path: "form-4",
          handle: { title: "app.regulatedForms.form4" },
          element: withAccess(<RegulatedCashFlowPage />, accountingReportPermissions.cashFlow),
        },
        {
          path: "express-check",
          handle: { title: "app.regulatedForms.expressCheck" },
          element: withAccess(<ExpressCheckPage />, accountingReportPermissions.balanceSheet),
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
      path: "document-journal",
      handle: { title: "app.documentJournal.title" },
      element: withAccess(<DocumentJournalPage />, accountingReportPermissions.journal),
    },
    {
      path: "tax-reports",
      handle: { title: "app.taxReports.title" },
      element: <Outlet />,
      children: [
        { index: true, element: <Navigate to="vat-return" replace /> },
        { path: "vat-return", handle: { title: "app.taxReports.vatReturn" }, element: withAccess(<VatReturnPage />, accountingReportPermissions.incomeStatement) },
        { path: "vat-register", handle: { title: "app.taxReports.vatRegister" }, element: withAccess(<VatRegisterPage />, accountingReportPermissions.incomeStatement) },
        { path: "turnover-tax", handle: { title: "app.taxReports.turnoverTax" }, element: withAccess(<TurnoverTaxPage />, accountingReportPermissions.incomeStatement) },
        { path: "profit-tax", handle: { title: "app.taxReports.profitTax" }, element: withAccess(<ProfitTaxPage />, accountingReportPermissions.incomeStatement) },
        { path: "payroll-tax", handle: { title: "app.taxReports.payrollTax" }, element: withAccess(<PayrollTaxReturnPage />, accountingReportPermissions.incomeStatement) },
        { path: "property-tax", handle: { title: "app.taxReports.propertyTax" }, element: withAccess(<PropertyTaxPage />, accountingReportPermissions.incomeStatement) },
      ],
    },
    {
      path: "trial-balance",
      handle: { title: "app.accounting.trialBalance" },
      element: withAccess(<TrialBalancePage />, trialBalancePermissions.view),
    },
    {
      path: "manual-entries",
      handle: { title: "manualEntries.title" },
      element: <Outlet />,
      children: [
        { index: true, element: withAccess(<ManualEntriesPage />, "MANUAL_ENTRY_VIEW") },
        { path: "new", element: withAccess(<ManualEntryEditorPage />, "MANUAL_ENTRY_CREATE") },
        { path: ":id", element: withAccess(<ManualEntryEditorPage />, "MANUAL_ENTRY_VIEW") },
      ],
    },
    {
      path: "periods",
      handle: { title: "periods.title" },
      element: <PeriodsPage />,
    },
    {
      path: "deferred-expenses",
      handle: { title: "deferredExpenses.title" },
      element: withAccess(<DeferredExpensesPage />, "ACCOUNTING_PERIOD_CLOSE"),
    },
    {
      path: "currency-rates",
      handle: { title: "currency.rates.title" },
      element: withAccess(<CurrencyRatesPage />, currencyRatePermissions.view),
    },
    {
      path: "currency-revaluation",
      handle: { title: "currency.revaluation.title" },
      element: withAccess(<CurrencyRevaluationPage />, currencyRevaluationPermissions.view),
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
