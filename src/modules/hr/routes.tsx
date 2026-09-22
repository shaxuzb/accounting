import { lazy } from "react";
import PermissionCard from "@/components/ui/card/PermissionCard";
const PayrollEmployeeDetailPage = lazy(() => import("@/modules/settings/pages/payrollEmployees/screens/PayrollEmployeeDetailPage"));
const PayrollEmployeeListPage = lazy(() => import("@/modules/settings/pages/payrollEmployees/screens/PayrollEmployeeListPage"));
import { Outlet, type RouteObject } from "react-router";
import {
  hrAbsencePermissions,
  hrEmployeePermissions,
  hrOrderPermissions,
  hrViewPermissions,
} from "./constants/permissions";
const HrAbsenceListPage = lazy(() => import("./pages/absences/screens/HrAbsenceListPage"));
const HrOrderDetailPage = lazy(() => import("./pages/orders").then((m) => ({ default: m.HrOrderDetailPage })));
const HrOrderListPage = lazy(() => import("./pages/orders").then((m) => ({ default: m.HrOrderListPage })));

const withPermission = (
  element: React.ReactElement,
  permission: string | readonly string[],
) => {
  const permissionValue =
    typeof permission === "string" ? permission : [...permission];
  return (
    <PermissionCard permission={permissionValue} mode="redirect">
      {element}
    </PermissionCard>
  );
};

export const hrRoutes: RouteObject = {
  path: "hr",
  element: withPermission(<Outlet />, hrViewPermissions),
  handle: { title: "hr.title" },
  children: [
    {
      index: true,
      element: withPermission(
        <PayrollEmployeeListPage />,
        hrEmployeePermissions.view,
      ),
    },
    {
      path: "employees",
      handle: { title: "hr.employees.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PayrollEmployeeListPage />,
            hrEmployeePermissions.view,
          ),
        },
        {
          path: ":id",
          handle: {
            title: "hr.employees.detailTitle",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <PayrollEmployeeDetailPage />,
            hrEmployeePermissions.view,
          ),
        },
      ],
    },
    {
      path: "absences",
      handle: { title: "hr.absences.title" },
      element: withPermission(
        <HrAbsenceListPage />,
        hrAbsencePermissions.view,
      ),
    },
    {
      path: "orders",
      handle: { title: "hr.orders.title" },
      children: [
        { index: true, element: withPermission(<HrOrderListPage />, hrOrderPermissions.view) },
        { path: "add", handle: { title: "hr.orders.create", showBack: true, backTo: ".." }, element: withPermission(<HrOrderDetailPage />, hrOrderPermissions.create) },
        { path: ":id", handle: { title: "hr.orders.detailTitle", showBack: true, backTo: ".." }, element: withPermission(<HrOrderDetailPage />, hrOrderPermissions.view) },
      ],
    },
  ],
};
