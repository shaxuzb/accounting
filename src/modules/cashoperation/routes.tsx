import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { cashOperationPermissions } from "./pages/cashoperation/constants/permissions";
import CashOperationDetailPage from "./pages/cashoperation/screens/CashOperationDetailPage";
import CashOperationListPage from "./pages/cashoperation/screens/CashOperationListPage";

const withPermission = (
  element: ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const cashOperationRoutes: RouteObject = {
  path: "cash-operations",
  handle: { title: "Kassa" },
  element: <Outlet />,
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
      handle: { title: "Kassa hujjati", showBack: true, backTo: ".." },
    },
  ],
};
