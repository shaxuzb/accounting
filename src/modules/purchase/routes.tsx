import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import PurchaseListPage from "./pages/purchase/PurchaseListPage";
import PurchaseDetailPage from "./pages/purchase/PurchaseDetailPage";
import PurchaseImportPage from "./pages/purchase/PurchaseImportPage";
import { purchasePermissions } from "./constants/permissions";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const purchaseRoutes: RouteObject = {
  path: "purchase",
  handle: { title: "purchase.title" },
  children: [
    {
      index: true,
      element: withPermission(<PurchaseListPage />, purchasePermissions.view),
    },
    {
      path: "import",
      element: withPermission(
        <PurchaseImportPage />,
        purchasePermissions.create,
      ),
      handle: { title: "purchase.importTitle", showBack: true, backTo: ".." },
    },
    {
      path: ":id",
      element: withPermission(
        <PurchaseDetailPage />,
        purchasePermissions.detail,
      ),
      handle: { title: "purchase.detailTitle", showBack: true, backTo: ".." },
    },
  ],
};
