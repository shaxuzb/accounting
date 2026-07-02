import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import PostingTemplateViewsPage from "./pages/screens/PostingTemplateViewsPage";
import PostingTemplateViewDetailPage from "./pages/screens/PostingTemplateViewDetailPage";
import { dashboardPermissions } from "./pages/constants/permissions";

const withPermission = (
  element: ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const dashboardRoutes: RouteObject = {
  path: "dashboard",
  handle: { title: "Posting Template Views" },
  children: [
    {
      index: true,
      element: withPermission(
        <PostingTemplateViewsPage />,
        dashboardPermissions.view,
      ),
      // handle: { title: "Posting Template Views" },
    },
    {
      path: "posting-template-views/:id",
      element: withPermission(
        <PostingTemplateViewDetailPage />,
        dashboardPermissions.view,
      ),
      // handle: {
      //   title: "Posting Template View Detail",
      //   showBack: true,
      //   backTo: "..",
      // },
    },
  ],
};
