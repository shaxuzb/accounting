import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SaleAddEditPage from "./pages/sale/screens/SaleAddEditPage";
import SaleDetailPage from "./pages/sale/screens/SaleDetailPage";
import SaleListPage from "./pages/sale/screens/SaleListPage";
import { salePermissions } from "./pages/sale/constants/permissions";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const saleRoutes: RouteObject = {
  path: "sale",
  handle: { title: "Sotuv" },
  children: [
    {
      index: true,
      element: withPermission(<SaleListPage />, salePermissions.view),
    },
    {
      path: "add",
      element: withPermission(<SaleAddEditPage />, salePermissions.create),
      handle: { title: "Yangi savdo", showBack: true, backTo: ".." },
    },
    {
      path: "edit/:id",
      element: withPermission(<SaleAddEditPage />, salePermissions.update),
      handle: { title: "Savdoni o'zgartirish", showBack: true, backTo: "../.." },
    },
    {
      path: ":id",
      element: withPermission(<SaleDetailPage />, salePermissions.detail),
      handle: { title: "Savdo hujjati", showBack: true, backTo: ".." },
    },
  ],
};
