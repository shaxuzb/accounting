import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const SaleAddEditPage = lazy(() => import("./pages/sale/screens/SaleAddEditPage"));
const SaleDetailPage = lazy(() => import("./pages/sale/screens/SaleDetailPage"));
const SaleListPage = lazy(() => import("./pages/sale/screens/SaleListPage"));
import { salePermissions } from "./pages/sale/constants/permissions";
const ContractListPage = lazy(() => import("../contract/screens/ContractListPage"));
import { contractPermissions } from "../contract/constants/permissions";
const RetailSaleDetailPage = lazy(() => import("./pages/retail-sale").then((m) => ({ default: m.RetailSaleDetailPage })));
const RetailSaleEditorPage = lazy(() => import("./pages/retail-sale").then((m) => ({ default: m.RetailSaleEditorPage })));
const RetailSaleListPage = lazy(() => import("./pages/retail-sale").then((m) => ({ default: m.RetailSaleListPage })));
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
