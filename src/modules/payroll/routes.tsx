import { lazy } from "react";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { Outlet, type RouteObject } from "react-router";
import {
  payrollDocumentPermissions,
  payrollPaymentPermissions,
  payrollPeriodPermissions,
  payrollReportPermissions,
  payrollTimesheetPermissions,
} from "./constants/permissions";
const PayrollDocumentDetailPage = lazy(() => import("./pages/documents/screens/PayrollDocumentDetailPage"));
const PayrollDocumentListPage = lazy(() => import("./pages/documents/screens/PayrollDocumentListPage"));
const PayrollPaymentDetailPage = lazy(() => import("./pages/payments/screens/PayrollPaymentDetailPage"));
const PayrollPaymentListPage = lazy(() => import("./pages/payments/screens/PayrollPaymentListPage"));
const PayrollPeriodListPage = lazy(() => import("./pages/periods/screens/PayrollPeriodListPage"));
const PayrollPayslipReportPage = lazy(() => import("./pages/reports/screens/PayrollPayslipReportPage"));
const PayrollRegisterReportPage = lazy(() => import("./pages/reports/screens/PayrollRegisterReportPage"));
const PayrollTimesheetDetailPage = lazy(() => import("./pages/timesheets/screens/PayrollTimesheetDetailPage"));
const PayrollTimesheetListPage = lazy(() => import("./pages/timesheets/screens/PayrollTimesheetListPage"));
import "./styles.css";

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
  element: (
    <div className="payroll-module">
      <Outlet />
    </div>
  ),
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
