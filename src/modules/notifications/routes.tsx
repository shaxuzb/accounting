import { lazy } from "react";
import type { RouteObject } from "react-router";

const NotificationsPage = lazy(() => import("./NotificationsPage"));

/** The user's notifications: open to every user, each sees only their own. */
export const notificationsRoutes: RouteObject = {
  path: "notifications",
  handle: { title: "notifications.title" },
  element: <NotificationsPage />,
};
