import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";
import Organization from "./components/Organization";
import RoleListPage from "./pages/role";
import RoleAddPage from "./pages/role/add";
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
    {
      path: "role",
      handle: { title: "Role" },
      children: [
        { index: true, element: <RoleListPage /> },
        {
          path: "add",
          element: <RoleAddPage />,
          handle: { title: "Add Role", showBack: true, backTo: ".." },
        },
      ],
    },
    /* modux:routes */
  ],
};
