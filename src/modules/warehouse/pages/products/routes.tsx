import { lazy } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const ProductListPage = lazy(() => import("./screens/ProductListPage"));
import { productPermissions } from "./constants/permissions";
const ProductAddEditPage = lazy(() => import("./screens/ProductAddEditPage"));


const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const productsRoutes: RouteObject = {
  path: "warehouses/products",
  handle: { title: "products.title" },
  children: [
    {
      index: true,
      element: withPermission(<ProductListPage />, productPermissions.view),
    },
    {
      path: "add",
      element: withPermission(<ProductAddEditPage />, productPermissions.create),
      handle: { title: "products.createTitle", showBack: true, backTo: ".." },
    },
    {
      path: "edit/:id",
      element: withPermission(<ProductAddEditPage />, productPermissions.update),
      handle: { title: "products.editTitle", showBack: true, backTo: ".." },
    },
  ],
};
