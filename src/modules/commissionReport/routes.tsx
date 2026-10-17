import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { commissionReportKinds, commissionReportPermissions, type CommissionReportKind } from "./api";

const CommissionReportListPage = lazy(() => import("./CommissionReportListPage"));
const CommissionReportEditorPage = lazy(() => import("./CommissionReportEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

const titleKey = (kind: CommissionReportKind) =>
  kind === commissionReportKinds.fromAgent ? "commissionReport.fromAgentTitle" : "commissionReport.toCommittentTitle";

/** The commission fee reports of one side, under its module's path. */
export const commissionReportRoute = (kind: CommissionReportKind, path: string): RouteObject => ({
  path,
  handle: { title: titleKey(kind) },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<CommissionReportListPage kind={kind} />, commissionReportPermissions.view) },
    {
      path: "new",
      handle: { title: "commissionReport.new", showBack: true, backTo: ".." },
      element: withPermission(<CommissionReportEditorPage kind={kind} />, commissionReportPermissions.create),
    },
    {
      path: ":id",
      handle: { title: titleKey(kind), showBack: true, backTo: ".." },
      element: withPermission(<CommissionReportEditorPage kind={kind} />, commissionReportPermissions.view),
    },
  ],
});
