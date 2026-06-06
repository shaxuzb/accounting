import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout, ProtectAuthLayout } from "@/app/layouts";
import { authRoutes } from "@/modules/auth";
import { settingsRoutes } from "@/modules/settings/routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  authRoutes,
  {
    path: "/",
    element: <ProtectAuthLayout />,
    children: [
      {
        path: "main",
        element: <MainLayout />,
        children: [
          settingsRoutes,
        ],
      },
    ],
  },
]);
