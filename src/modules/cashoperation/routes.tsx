import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { cashOperationPermissions } from "./pages/cashoperation/constants/permissions";
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
  children: [
    {
      index: true,
      element: withPermission(
        <CashOperationListPage />,
        cashOperationPermissions.view,
      ),
    },
  ],
};
