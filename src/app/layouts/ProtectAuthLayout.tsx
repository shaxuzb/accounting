import { Outlet } from "react-router";

// Outermost layout — the place for app-wide guards, suspense or global UI.
export default function ProtectAuthLayout() {
  return <Outlet />;
}
