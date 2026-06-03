import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout, ProtectAuthLayout } from "@/app/layouts";
import NotFound from "@/shared/components/NotFound";
import { authRoutes } from "./authRoutes";
/* modux:module-imports */

export const router = createBrowserRouter([
  {
    element: <ProtectAuthLayout />,
    children: [
      { index: true, element: <Navigate to="/main" replace /> },
      ...authRoutes,
      {
        path: "main",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: (
              <div className="p-6 text-gray-500">
                Welcome. Generate a feature with <code>modux gen module &lt;name&gt;</code>.
              </div>
            ),
          },
          /* modux:module-routes */
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
