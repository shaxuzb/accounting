import { lazy } from "react";
import type { RouteObject } from "react-router";

const ManualLayout = lazy(() => import("./ManualLayout"));
const ManualHomePage = lazy(() => import("./ManualHomePage"));
const ManualArticlePage = lazy(() => import("./ManualArticlePage"));

/** The user's manual, open to every user (it describes the pages, it opens none of them). */
export const manualRoutes: RouteObject = {
  path: "manual",
  handle: { title: "manual.title" },
  element: <ManualLayout />,
  children: [
    { index: true, element: <ManualHomePage /> },
    {
      path: ":sectionId/:articleId",
      handle: { title: "manual.title", showBack: true, backTo: "/main/manual" },
      element: <ManualArticlePage />,
    },
  ],
};
