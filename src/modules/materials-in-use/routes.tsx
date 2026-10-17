import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { materialsInUseJournals, materialsInUsePermissions, type MaterialsInUseKind } from "./api";

const MaterialsInUseListPage = lazy(() => import("./MaterialsInUseListPage"));
const MaterialsInUseEditorPage = lazy(() => import("./MaterialsInUseEditorPage"));
const MaterialsInUseBalancePage = lazy(() => import("./MaterialsInUseBalancePage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/** A journal of materials in use under the warehouse module: transfers, write-offs, returns. */
export const materialsInUseRoute = (kind: MaterialsInUseKind, path: string): RouteObject => ({
  path,
  handle: { title: materialsInUseJournals[kind].titleKey },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<MaterialsInUseListPage kind={kind} />, materialsInUsePermissions.view) },
    {
      path: "new",
      handle: { title: "materialsInUse.new", showBack: true, backTo: ".." },
      element: withPermission(<MaterialsInUseEditorPage kind={kind} />, materialsInUsePermissions.create),
    },
    {
      path: ":id",
      handle: { title: materialsInUseJournals[kind].titleKey, showBack: true, backTo: ".." },
      element: withPermission(<MaterialsInUseEditorPage kind={kind} />, materialsInUsePermissions.view),
    },
  ],
});

/** 1C «Материалы в эксплуатации»: what is in use on a date. */
export const materialsInUseBalanceRoute = (path: string): RouteObject => ({
  path,
  handle: { title: "materialsInUse.balanceTitle" },
  element: withPermission(<MaterialsInUseBalancePage />, materialsInUsePermissions.view),
});
