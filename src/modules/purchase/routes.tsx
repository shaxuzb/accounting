import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { purchasePermissions } from "./pages/purchase/constants/permissions";
import PurchaseListPage from "./pages/purchase/screens/PurchaseListPage";
import PurchaseDetailPage from "./pages/purchase/screens/PurchaseDetailPage";
import ContractListPage from "../contract/screens/ContractListPage";
import { contractPermissions } from "../contract/constants/permissions";
import PurchaseEditor from "./pages/purchase/screens/PurchaseEditorPage";


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
            <PurchaseEditor />,
            purchasePermissions.create,
          ),
          handle: {
            title: "purchase.importTitle",
            showBack: true,
            backTo: "..",
            tabSuffix: "docNumber",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <PurchaseEditor />,
            purchasePermissions.update,
          ),
          handle: {
            title: "purchase.detailTitle",
            showBack: true,
            backTo: "..",
            tabSuffix: "docNumber",
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
            tabSuffix: "docNumber",
          },
        },
      ],
    },
    {
      path: "contracts",
      handle: { title: "contract.purchaseTitle" },
      element: withPermission(
        <ContractListPage />,
        contractPermissions.view,
      ),
    },
  ],
};
