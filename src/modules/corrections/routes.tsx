import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { correctionPermissions, corrections, type CorrectionKind } from "./constants";

const CorrectionListPage = lazy(() => import("./CorrectionListPage"));
const CorrectionEditorPage = lazy(() => import("./CorrectionEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/** The corrections of posted sales or purchases: the list, a new one, one. */
export const correctionRoute = (kind: CorrectionKind, path: string): RouteObject => ({
  path,
  handle: { title: corrections[kind].titleKey },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<CorrectionListPage kind={kind} />, correctionPermissions.view) },
    {
      path: "new",
      handle: { title: corrections[kind].newKey, showBack: true, backTo: ".." },
      element: withPermission(<CorrectionEditorPage kind={kind} />, correctionPermissions.create),
    },
    {
      path: ":id",
      handle: { title: corrections[kind].titleKey, showBack: true, backTo: ".." },
      element: withPermission(<CorrectionEditorPage kind={kind} />, correctionPermissions.view),
    },
  ],
});
