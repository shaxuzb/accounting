import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { productionDocs, type ProductionDocKind } from "./constants";

const ProductionDocListPage = lazy(() => import("./ProductionDocListPage"));
const ProductionDocEditorPage = lazy(() => import("./ProductionDocEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

const docRoute = (path: string, kind: ProductionDocKind): RouteObject => {
  const doc = productionDocs[kind];
  return {
    path,
    handle: { title: doc.titleKey },
    element: <Outlet />,
    children: [
      { index: true, element: withPermission(<ProductionDocListPage kind={kind} />, doc.permissions.view) },
      {
        path: "new",
        handle: { title: doc.newKey, showBack: true, backTo: ".." },
        element: withPermission(<ProductionDocEditorPage kind={kind} />, doc.permissions.create),
      },
      {
        path: ":id",
        handle: { title: doc.titleKey, showBack: true, backTo: ".." },
        element: withPermission(<ProductionDocEditorPage kind={kind} />, doc.permissions.view),
      },
    ],
  };
};

/** Production (1C «Производство»): material requisitions and production reports. */
export const productionRoutes: RouteObject = {
  path: "production",
  element: <Outlet />,
  children: [docRoute("requisitions", "requisition"), docRoute("reports", "report")],
};
