import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { extraCostPermissions } from "./constants";

const ExtraCostListPage = lazy(() => import("./ExtraCostListPage"));
const ExtraCostEditorPage = lazy(() => import("./ExtraCostEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/** The additional costs of purchases (1C «Поступление доп. расходов»): the list, a new one, one. */
export const extraCostRoute = (path: string): RouteObject => ({
  path,
  handle: { title: "extraCost.title" },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<ExtraCostListPage />, extraCostPermissions.view) },
    {
      path: "new",
      handle: { title: "extraCost.new", showBack: true, backTo: ".." },
      element: withPermission(<ExtraCostEditorPage />, extraCostPermissions.create),
    },
    {
      path: ":id",
      handle: { title: "extraCost.title", showBack: true, backTo: ".." },
      element: withPermission(<ExtraCostEditorPage />, extraCostPermissions.view),
    },
  ],
});
