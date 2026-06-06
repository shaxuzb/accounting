import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";
import Organization from "./components/Organization";
/* modux:imports */

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "Settings" },
  children: [
    { index: true, element: <SettingsListPage /> },
    {
      path: "organization",
      element: <Organization />,
    },
    // { path: "add", element: <SettingsAddPage />, handle: { title: "Add Settings", showBack: true, backTo: ".." } },
    // { path: ":id", element: <SettingsViewPage />, handle: { title: "View Settings", showBack: true, backTo: ".." } },
    /* modux:routes */
  ],
};
