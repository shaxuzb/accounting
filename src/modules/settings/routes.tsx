import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";

import RoleListPage from "./pages/role";
import RoleAddPage from "./pages/role/add";

import Users from "./pages/users";
/* modux:imports */

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "Sozlamalar" },
  children: [
    { index: true, element: <SettingsListPage /> },
    {
      path: "users",
      element: <Users />,
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
        {
          path: "edit/:id",
          element: <RoleAddPage />,
          handle: { title: "Edit Role", showBack: true, backTo: ".." },
        },
      ],
    },
    /* modux:routes */
  ],
};
