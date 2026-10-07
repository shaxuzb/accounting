import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { returnPermissions, returnTitleKeys, type ReturnKind } from "./constants";

const ReturnListPage = lazy(() => import("./ReturnListPage"));
const ReturnEditorPage = lazy(() => import("./ReturnEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/** The list, a new return and one return of a kind, under its module's path. */
export const returnRoute = (kind: ReturnKind, path: string): RouteObject => ({
  path,
  handle: { title: returnTitleKeys[kind] },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<ReturnListPage kind={kind} />, returnPermissions.view) },
    {
      path: "new",
      handle: { title: "returnDoc.new", showBack: true, backTo: ".." },
      element: withPermission(<ReturnEditorPage kind={kind} />, returnPermissions.create),
    },
    {
      path: ":id",
      handle: { title: returnTitleKeys[kind], showBack: true, backTo: ".." },
      element: withPermission(<ReturnEditorPage kind={kind} />, returnPermissions.view),
    },
  ],
});
