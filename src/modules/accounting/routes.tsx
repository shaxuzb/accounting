import type { RouteObject } from "react-router";
import AccountingEntriesReportPage from "./pages/accountingentriesreport/screens/AccountingEntriesReportPage";

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
