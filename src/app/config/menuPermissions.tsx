import type { ReactNode } from "react";
import { LayoutDashboard } from "lucide-react";

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon?: ReactNode;
  permission?: string;
  children?: MenuItem[];
}

export const menuPermissions: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/main", icon: <LayoutDashboard size={18} />, permission: "dashboard.view" },
  { key: "auth", label: "Auth", path: "/main/auth", permission: "auth.view" },
  /* modux:menu */
];
