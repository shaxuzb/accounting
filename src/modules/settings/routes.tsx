import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";
import Users from "./pages/users";
/* modux:imports */

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "Sozlamalar" },
  children: [
    { index: true, 
      element: <SettingsListPage />,
    },
    {
      path: "users",
      element: <Users />,
    },
    // { path: "add", element: <SettingsAddPage />, handle: { title: "Add Settings", showBack: true, backTo: ".." } },
    // { path: ":id", element: <SettingsViewPage />, handle: { title: "View Settings", showBack: true, backTo: ".." } },
    /* modux:routes */
  ],
};
