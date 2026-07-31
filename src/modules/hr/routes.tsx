import PermissionCard from "@/components/ui/card/PermissionCard";
import PayrollEmployeeDetailPage from "@/modules/settings/pages/payrollEmployees/screens/PayrollEmployeeDetailPage";
import PayrollEmployeeListPage from "@/modules/settings/pages/payrollEmployees/screens/PayrollEmployeeListPage";
import { Outlet, type RouteObject } from "react-router";
import {
  hrAbsencePermissions,
  hrEmployeePermissions,
  hrViewPermissions,
} from "./constants/permissions";
import HrAbsenceListPage from "./pages/absences/screens/HrAbsenceListPage";

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
  ],
};
