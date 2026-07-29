import PermissionCard from "@/components/ui/card/PermissionCard";
import { Outlet, type RouteObject } from "react-router";
import {
  payrollDocumentPermissions,
  payrollPaymentPermissions,
  payrollPeriodPermissions,
  payrollReportPermissions,
  payrollTimesheetPermissions,
} from "./constants/permissions";
import PayrollDocumentDetailPage from "./pages/documents/screens/PayrollDocumentDetailPage";
import PayrollDocumentListPage from "./pages/documents/screens/PayrollDocumentListPage";
import PayrollPaymentDetailPage from "./pages/payments/screens/PayrollPaymentDetailPage";
import PayrollPaymentListPage from "./pages/payments/screens/PayrollPaymentListPage";
import PayrollPeriodListPage from "./pages/periods/screens/PayrollPeriodListPage";
import PayrollPayslipReportPage from "./pages/reports/screens/PayrollPayslipReportPage";
import PayrollRegisterReportPage from "./pages/reports/screens/PayrollRegisterReportPage";
import PayrollTimesheetDetailPage from "./pages/timesheets/screens/PayrollTimesheetDetailPage";
import PayrollTimesheetListPage from "./pages/timesheets/screens/PayrollTimesheetListPage";

const withPermission = (
  element: React.ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const payrollRoutes: RouteObject = {
  path: "payroll",
  element: <Outlet />,
  children: [
    {
      path: "periods",
      handle: { title: "payroll.periods.title" },
      element: withPermission(
        <PayrollPeriodListPage />,
        payrollPeriodPermissions.view,
      ),
    },
    {
      path: "timesheets",
      handle: { title: "payroll.timesheets.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PayrollTimesheetListPage />,
            payrollTimesheetPermissions.view,
          ),
        },
        {
          path: "add",
          handle: {
            title: "payroll.timesheets.createTitle",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <PayrollTimesheetDetailPage />,
            payrollTimesheetPermissions.create,
          ),
        },
        {
          path: ":id",
          handle: {
            title: "payroll.timesheets.detailTitle",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <PayrollTimesheetDetailPage />,
            payrollTimesheetPermissions.view,
          ),
        },
      ],
    },
    {
      path: "documents",
      handle: { title: "payroll.documents.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PayrollDocumentListPage />,
            payrollDocumentPermissions.view,
          ),
        },
        {
          path: ":id",
          handle: {
            title: "payroll.documents.detailTitle",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <PayrollDocumentDetailPage />,
            payrollDocumentPermissions.view,
          ),
        },
      ],
    },
    {
      path: "payments",
      handle: { title: "payroll.payments.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PayrollPaymentListPage />,
            payrollPaymentPermissions.view,
          ),
        },
        {
          path: "add",
          handle: {
            title: "payroll.payments.createTitle",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <PayrollPaymentDetailPage />,
            payrollPaymentPermissions.create,
          ),
        },
        {
          path: ":id",
          handle: {
            title: "payroll.payments.detailTitle",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <PayrollPaymentDetailPage />,
            payrollPaymentPermissions.view,
          ),
        },
      ],
    },
    {
      path: "reports",
      element: <Outlet />,
      children: [
        {
          path: "register",
          handle: { title: "payroll.reports.registerTitle" },
          element: withPermission(
            <PayrollRegisterReportPage />,
            payrollReportPermissions.view,
          ),
        },
        {
          path: "payslip",
          handle: { title: "payroll.reports.payslipTitle" },
          element: withPermission(
            <PayrollPayslipReportPage />,
            payrollReportPermissions.view,
          ),
        },
      ],
    },
  ],
};
