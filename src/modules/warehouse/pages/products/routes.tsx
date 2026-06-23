import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ProductListPage from "./screens/ProductListPage";
import { productPermissions } from "./constants/permissions";
import ProductAddEditPage from "./screens/ProductAddEditPage";


const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const productsRoutes: RouteObject = {
  path: "products",
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
