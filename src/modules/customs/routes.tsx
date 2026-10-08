import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { customsPermissions } from "./constants";

const CustomsListPage = lazy(() => import("./CustomsListPage"));
const CustomsEditorPage = lazy(() => import("./CustomsEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/** Customs declarations of imports (1C «Таможенная декларация (импорт)»): the list, a new one, one. */
export const customsRoute = (path: string): RouteObject => ({
  path,
  handle: { title: "customs.title" },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<CustomsListPage />, customsPermissions.view) },
    {
      path: "new",
      handle: { title: "customs.new", showBack: true, backTo: ".." },
      element: withPermission(<CustomsEditorPage />, customsPermissions.create),
    },
    {
      path: ":id",
      handle: { title: "customs.title", showBack: true, backTo: ".." },
      element: withPermission(<CustomsEditorPage />, customsPermissions.view),
    },
  ],
});
