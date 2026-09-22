import { lazy } from "react";
import type { RouteObject } from "react-router";
const Login = lazy(() => import("./pages/auth/Login"));

export const authRoutes: RouteObject = {
  path: "login",
  element: <Login />,
};
