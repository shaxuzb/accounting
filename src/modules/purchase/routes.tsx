import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { purchasePermissions } from "./pages/purchase/constants/permissions";
import PurchaseListPage from "./pages/purchase/screens/PurchaseListPage";
import PurchaseDetailPage from "./pages/purchase/screens/PurchaseDetailPage";
import ContractListPage from "../contract/screens/ContractListPage";
import PurchaseImportPage from "./pages/purchase/screens/PurchaseImportPage";


const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const purchaseRoutes: RouteObject = {
  path: "purchases",
  element: <Outlet />,
  children: [
    {
      path: "purchase",
      handle: { title: "purchase.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PurchaseListPage />,
            purchasePermissions.view,
          ),
        },
        {
          path: "import",
          element: withPermission(
            <PurchaseImportPage />,
            purchasePermissions.create,
          ),
          handle: {
            title: "purchase.importTitle",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <PurchaseImportPage />,
            purchasePermissions.update,
          ),
          handle: {
            title: "purchase.detailTitle",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <PurchaseDetailPage />,
            purchasePermissions.detail,
          ),
          handle: {
            title: "purchase.detailTitle",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "contracts",
      handle: { title: "contract.purchaseTitle" },
      element: <ContractListPage />,
    },
  ],
};
