import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { conversionJournals, conversionPermissions, type ConversionJournal } from "./api";

const ConversionListPage = lazy(() => import("./ConversionListPage"));
const ConversionEditorPage = lazy(() => import("./ConversionEditorPage"));

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/** A conversion journal under the warehouse module: assemblies, re-gradings, transfers between accounts. */
export const conversionRoute = (journal: ConversionJournal, path: string): RouteObject => ({
  path,
  handle: { title: conversionJournals[journal].titleKey },
  element: <Outlet />,
  children: [
    { index: true, element: withPermission(<ConversionListPage journal={journal} />, conversionPermissions.view) },
    {
      path: "new",
      handle: { title: "conversion.new", showBack: true, backTo: ".." },
      element: withPermission(<ConversionEditorPage journal={journal} />, conversionPermissions.create),
    },
    {
      path: ":id",
      handle: { title: conversionJournals[journal].titleKey, showBack: true, backTo: ".." },
      element: withPermission(<ConversionEditorPage journal={journal} />, conversionPermissions.view),
    },
  ],
});
