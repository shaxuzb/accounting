import { type RouteObject, Outlet } from "react-router";
import PostingTemplateViewDetailPage from "./pages/dashboard/screens/PostingTemplateViewDetailPage";
import PostingTemplateViewsPage from "./pages/dashboard/screens/PostingTemplateViewsPage";

export const adminRoutes: RouteObject = {
  path: "dashboard",
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <PostingTemplateViewsPage />,
      handle: { title: "Posting Template Views" },
    },
    {
      path: "posting-template-views",
      element: <PostingTemplateViewsPage />,
      handle: { title: "Posting Template Views" },
    },
    {
      path: "posting-template-views/:id",
      element: <PostingTemplateViewDetailPage />,
      handle: { title: "Posting Template View Detail" },
    },
  ],
};
