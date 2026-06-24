import PermissionCard from "@/components/ui/card/PermissionCard";
import { type RouteObject } from "react-router";
import { warehousePermissions } from "./pages/warehouse/constants/permissions";
import ProductSummaryListPage from "./pages/warehouse/screens/ProductSummaryListPage";
import ProductDetail from "./pages/warehouse/screens/ProductDetail";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const warehouseRoutes: RouteObject = {
  path: "warehouses/warehouse",
  handle: { title: "warehouses.title" },
  children: [
    {
      index: true,
      element: withPermission(<ProductSummaryListPage />, warehousePermissions.view),
    },
    {
      path: ":id",
      element: withPermission(<ProductDetail />, warehousePermissions.view),
    }
  ],
};
