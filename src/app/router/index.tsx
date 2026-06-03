import { createBrowserRouter } from "react-router";
import { ProtectAuthLayout } from "@/app/layouts";
import { authRoutes } from "@/modules/auth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectAuthLayout />,
    children: [authRoutes],
  },
]);
