import { lazy } from "react";
import type { RouteObject } from "react-router";
const AccountingEntriesReportPage = lazy(() => import("./pages/accountingentriesreport/screens/AccountingEntriesReportPage"));

export const accountingRoutes: RouteObject = {
  path: "accountingentriesreport",
  element: <AccountingEntriesReportPage />,
  handle: {
    title: "app.routes.accountingEntries",
    showBack: true,
    backTo: "..",
    tabSuffix: "documentId",
  },
};
