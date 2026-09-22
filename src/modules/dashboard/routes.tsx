import { lazy } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const DashboardPage = lazy(() => import("./pages/dashboard"));
import { dashboardPermissions } from "./constants/permissions";

export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  handle: { title: "dashboard.title" },
  element: (
    <PermissionCard permission={dashboardPermissions.view} mode="redirect">
      <DashboardPage />
    </PermissionCard>
  ),
};
