import { lazy } from "react";
import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Navigate, Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { operationalReportPermissions } from "./constants/permissions";
const BankReportPage = lazy(() => import("./screens").then((m) => ({ default: m.BankReportPage })));
const CashReportPage = lazy(() => import("./screens").then((m) => ({ default: m.CashReportPage })));
const InventoryCountReportPage = lazy(() => import("./screens").then((m) => ({ default: m.InventoryCountReportPage })));
const PayableReportPage = lazy(() => import("./screens").then((m) => ({ default: m.PayableReportPage })));
const PurchaseReportPage = lazy(() => import("./screens").then((m) => ({ default: m.PurchaseReportPage })));
const ReceivableReportPage = lazy(() => import("./screens").then((m) => ({ default: m.ReceivableReportPage })));
const SalesReportPage = lazy(() => import("./screens").then((m) => ({ default: m.SalesReportPage })));
const WarehouseTransferReportPage = lazy(() => import("./screens").then((m) => ({ default: m.WarehouseTransferReportPage })));

const withAccess = (element: ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

/**
 * Operativ hisobotlar `api/reports/*` endpointlari ustida ishlaydi va
 * buxgalteriya hisobotlaridan (`accountings/reports`) ajratilgan: bular
 * hujjat kesimidagi ro'yxatlar, u yerdagilar esa hisob kesimidagi shakllar.
 */
export const reportsRoutes: RouteObject = {
  path: "reports",
  element: <Outlet />,
  handle: { title: "reports.title" },
  children: [
    { index: true, element: <Navigate to="sales" replace /> },
    {
      path: "sales",
      handle: { title: "reports.pages.sales" },
      element: withAccess(
        <SalesReportPage />,
        operationalReportPermissions.sales.view,
      ),
    },
    {
      path: "purchase",
      handle: { title: "reports.pages.purchase" },
      element: withAccess(
        <PurchaseReportPage />,
        operationalReportPermissions.purchase.view,
      ),
    },
    {
      path: "warehouse-transfers",
      handle: { title: "reports.pages.warehouseTransfers" },
      element: withAccess(
        <WarehouseTransferReportPage />,
        operationalReportPermissions.warehouseTransfers.view,
      ),
    },
    {
      path: "inventory-counts",
      handle: { title: "reports.pages.inventoryCounts" },
      element: withAccess(
        <InventoryCountReportPage />,
        operationalReportPermissions.inventoryCounts.view,
      ),
    },
    {
      path: "bank",
      handle: { title: "reports.pages.bank" },
      element: withAccess(
        <BankReportPage />,
        operationalReportPermissions.bank.view,
      ),
    },
    {
      path: "cash",
      handle: { title: "reports.pages.cash" },
      element: withAccess(
        <CashReportPage />,
        operationalReportPermissions.cash.view,
      ),
    },
    {
      path: "receivable",
      handle: { title: "reports.pages.receivable" },
      element: withAccess(
        <ReceivableReportPage />,
        operationalReportPermissions.receivable.view,
      ),
    },
    {
      path: "payable",
      handle: { title: "reports.pages.payable" },
      element: withAccess(
        <PayableReportPage />,
        operationalReportPermissions.payable.view,
      ),
    },
    { path: "*", element: <Navigate to="." replace /> },
  ],
};
