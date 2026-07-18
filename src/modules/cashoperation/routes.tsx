import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { cashOperationPermissions } from "./pages/cashoperation/constants/permissions";
import { cashDocumentPermissions } from "./pages/cash-document/constants/permissions";
import { cashBookPermissions } from "./pages/cash-book/constants/permissions";
import CashOperationDetailPage from "./pages/cashoperation/screens/CashOperationDetailPage";
import CashOperationListPage from "./pages/cashoperation/screens/CashOperationListPage";
import CashDocumentListPage from "./pages/cash-document/screens/CashDocumentListPage";
import CashDocumentDetailPage from "./pages/cash-document/screens/CashDocumentDetailPage";
import CashBookListPage from "./pages/cash-book/screens/CashBookListPage";
import CashBookDetailPage from "./pages/cash-book/screens/CashBookDetailPage";

const withPermission = (
  element: ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const cashOperationRoutes: RouteObject = {
  path: "cash-operationses",
  handle: { title: "app.menu.cash" },
  element: <Outlet />,
  children: [
    {
      path: "cash-operations",
      handle: { title: "app.menu.cashOperations" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashOperationListPage />,
            cashOperationPermissions.view,
          ),
        },
        {
          path: ":id",
          element: withPermission(
            <CashOperationDetailPage />,
            cashOperationPermissions.detail,
          ),
          handle: { title: "app.routes.cashDocument", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "cash-documents/:kind",
      handle: {
        title: (params: Record<string, string | undefined>) =>
          params.kind === "rko"
            ? "app.menu.expenseOrders"
            : "app.menu.incomeOrders",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <CashDocumentListPage />,
            cashDocumentPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <CashDocumentDetailPage />,
            cashDocumentPermissions.create,
          ),
          handle: {
            title: (params: Record<string, string | undefined>) =>
              params.kind === "rko"
                ? "app.routes.newExpenseOrder"
                : "app.routes.newIncomeOrder",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <CashDocumentDetailPage />,
            cashDocumentPermissions.detail,
          ),
          handle: {
            title: (params: Record<string, string | undefined>) =>
              params.kind === "rko"
                ? "app.routes.expenseOrder"
                : "app.routes.incomeOrder",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "cash-book",
      handle: { title: "app.menu.cashBook" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashBookListPage />,
            cashBookPermissions.view,
          ),
        },
        {
          path: ":cashBoxId",
          element: withPermission(
            <CashBookDetailPage />,
            cashBookPermissions.detail,
          ),
          handle: { title: "app.menu.cashBook", showBack: true, backTo: ".." },
        },
      ],
    },
  ],
};
