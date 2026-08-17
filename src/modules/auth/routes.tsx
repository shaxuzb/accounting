import type { RouteObject } from "react-router";
import Login from "./pages/auth/Login";

export const authRoutes: RouteObject = {
  path: "login",
  element: <Login />,
};
