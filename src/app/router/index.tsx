import { createBrowserRouter } from "react-router";
import { MainLayout, ProtectAuthLayout } from "@/app/layouts";
import { authRoutes } from "@/modules/auth";
import SettingsListPage from "@/modules/settings/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectAuthLayout />,

    children: [
      authRoutes,
      {
        path: "main",
        element: <MainLayout />,
        children:[
          {
            path:"settings",
            element: <SettingsListPage/>
          }
        ]
      },
    ],
  },
]);
