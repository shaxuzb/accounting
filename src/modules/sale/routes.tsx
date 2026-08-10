import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SaleAddEditPage from "./pages/sale/screens/SaleAddEditPage";
import SaleDetailPage from "./pages/sale/screens/SaleDetailPage";
import SaleListPage from "./pages/sale/screens/SaleListPage";
import { salePermissions } from "./pages/sale/constants/permissions";
import ContractListPage from "../contract/screens/ContractListPage";
import { contractPermissions } from "../contract/constants/permissions";
import {
  RetailSaleDetailPage,
  RetailSaleEditorPage,
  RetailSaleListPage,
} from "./pages/retail-sale";
import { retailSalePermissions } from "./pages/retail-sale/constants/permissions";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const saleRoutes: RouteObject = {
  path: "sales",
  element: <Outlet />,
  children: [
    {
      path: "sale",
      handle: { title: "sale.title" },
      children: [
        {
          index: true,
          element: withPermission(<SaleListPage />, salePermissions.view),
        },
        {
          path: "add",
          element: withPermission(<SaleAddEditPage />, salePermissions.create),
          handle: { title: "sale.new", showBack: true, backTo: ".." },
        },
        {
          path: "edit/:id",
          element: withPermission(<SaleAddEditPage />, salePermissions.update),
          handle: { title: "sale.edit", showBack: true, backTo: "../.." },
        },
        {
          path: ":id",
          element: withPermission(<SaleDetailPage />, salePermissions.detail),
          handle: { title: "sale.document", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "contracts",
      handle: { title: "contract.saleTitle" },
      element: withPermission(
        <ContractListPage />,
        contractPermissions.view,
      ),
    },
    {
      path: "retail-sale",
      handle: { title: "retailSale.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <RetailSaleListPage />,
            retailSalePermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <RetailSaleEditorPage />,
            retailSalePermissions.create,
          ),
          handle: {
            title: "retailSale.new",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <RetailSaleEditorPage />,
            retailSalePermissions.update,
          ),
          handle: {
            title: "retailSale.edit",
            showBack: true,
            backTo: "../..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <RetailSaleDetailPage />,
            retailSalePermissions.detail,
          ),
          handle: {
            title: "retailSale.document",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
  ],
};
