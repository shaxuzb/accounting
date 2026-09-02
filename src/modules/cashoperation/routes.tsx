import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { cashOperationPermissions } from "./pages/cashoperation/constants/permissions";
import { cashDocumentPermissions } from "./pages/cash-document/constants/permissions";
import { cashBookPermissions } from "./pages/cash-book/constants/permissions";
import CashOperationDetailPage from "./pages/cashoperation/screens/CashOperationDetailPage";
import CashOperationListPage from "./pages/cashoperation/screens/CashOperationListPage";
import CashOperationAddEditPage from "./pages/cashoperation/screens/CashOperationAddEditPage";
import CashDocumentListPage from "./pages/cash-document/screens/CashDocumentListPage";
import CashDocumentDetailPage from "./pages/cash-document/screens/CashDocumentDetailPage";
import CashBookListPage from "./pages/cash-book/screens/CashBookListPage";
import CashBookDetailPage from "./pages/cash-book/screens/CashBookDetailPage";
import CashCollectionListPage from "./pages/cash-collection/screens/CashCollectionListPage";
import CashCollectionDetailPage from "./pages/cash-collection/screens/CashCollectionDetailPage";
import { cashCollectionPermissions } from "./pages/cash-collection/constants/permissions";
import PaymentAcceptancePointOperationListPage from "./pages/payment-acceptance-point-operation/screens/PaymentAcceptancePointOperationListPage";
import PaymentAcceptancePointOperationDetailPage from "./pages/payment-acceptance-point-operation/screens/PaymentAcceptancePointOperationDetailPage";
import { paymentAcceptancePointOperationPermissions } from "./pages/payment-acceptance-point-operation/constants/permissions";
import CashFiscalTransferListPage from "./pages/cash-fiscal-transfer/screens/CashFiscalTransferListPage";
import CashFiscalTransferDetailPage from "./pages/cash-fiscal-transfer/screens/CashFiscalTransferDetailPage";
import { cashFiscalTransferPermissions } from "./pages/cash-fiscal-transfer/constants/permissions";
import PaymentAcceptancePointListPage from "./pages/paymentAcceptancePoint/screens/PaymentAcceptancePointListPage";
import { paymentAcceptancePointPermissions } from "./pages/paymentAcceptancePoint/constants/permissions";

const withPermission = (
  element: ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const cashOperationRoutes: RouteObject = {
  path: "cash-operationses",
  handle: { title: "app.menu.cash" },
  element: <Outlet />,
  children: [
    {
      path: "cash-operations",
      handle: { title: "app.menu.cashOperations" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashOperationListPage />,
            cashOperationPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <CashOperationAddEditPage />,
            cashOperationPermissions.create,
          ),
          handle: {
            title: "app.fields.cashOperation",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id/edit",
          element: withPermission(
            <CashOperationAddEditPage />,
            cashOperationPermissions.update,
          ),
          handle: {
            title: "app.fields.cashOperation",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <CashOperationDetailPage />,
            cashOperationPermissions.detail,
          ),
          handle: {
            title: "app.fields.cashOperation",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "cash-documents/:kind",
      handle: {
        title: (params: Record<string, string | undefined>) =>
          params.kind === "rko"
            ? "app.menu.expenseOrders"
            : "app.menu.incomeOrders",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <CashDocumentListPage />,
            cashDocumentPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <CashDocumentDetailPage />,
            cashDocumentPermissions.create,
          ),
          handle: {
            title: (params: Record<string, string | undefined>) =>
              params.kind === "rko"
                ? "app.routes.newExpenseOrder"
                : "app.routes.newIncomeOrder",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <CashDocumentDetailPage />,
            cashDocumentPermissions.detail,
          ),
          handle: {
            title: (params: Record<string, string | undefined>) =>
              params.kind === "rko"
                ? "app.routes.expenseOrder"
                : "app.routes.incomeOrder",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "cash-book",
      handle: { title: "app.menu.cashBook" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashBookListPage />,
            cashBookPermissions.view,
          ),
        },
        {
          path: ":cashBoxId",
          element: withPermission(
            <CashBookDetailPage />,
            cashBookPermissions.detail,
          ),
          handle: { title: "app.menu.cashBook", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "payment-acceptance-points",
      handle: { title: "app.menu.paymentAcceptancePoints" },
      element: withPermission(
        <PaymentAcceptancePointListPage />,
        paymentAcceptancePointPermissions.view,
      ),
    },
    {
      path: "cash-collection",
      handle: { title: "cash.collection.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashCollectionListPage />,
            cashCollectionPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <CashCollectionDetailPage />,
            cashCollectionPermissions.create,
          ),
          handle: {
            title: "cash.collection.create",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <CashCollectionDetailPage />,
            cashCollectionPermissions.detail,
          ),
          handle: {
            title: "cash.collection.title",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "payment-acceptance-point-operations",
      handle: { title: "cash.paymentAcceptancePointOperation.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PaymentAcceptancePointOperationListPage />,
            paymentAcceptancePointOperationPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <PaymentAcceptancePointOperationDetailPage />,
            paymentAcceptancePointOperationPermissions.create,
          ),
          handle: {
            title: "cash.paymentAcceptancePointOperation.create",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id/edit",
          element: withPermission(
            <PaymentAcceptancePointOperationDetailPage />,
            paymentAcceptancePointOperationPermissions.update,
          ),
          handle: {
            title: "cash.paymentAcceptancePointOperation.title",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <PaymentAcceptancePointOperationDetailPage />,
            paymentAcceptancePointOperationPermissions.detail,
          ),
          handle: {
            title: "cash.paymentAcceptancePointOperation.title",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "cash-fiscal-transfers",
      handle: { title: "cash.fiscalTransfer.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashFiscalTransferListPage />,
            cashFiscalTransferPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <CashFiscalTransferDetailPage />,
            cashFiscalTransferPermissions.create,
          ),
          handle: {
            title: "cash.fiscalTransfer.create",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id/edit",
          element: withPermission(
            <CashFiscalTransferDetailPage />,
            cashFiscalTransferPermissions.update,
          ),
          handle: {
            title: "cash.fiscalTransfer.title",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <CashFiscalTransferDetailPage />,
            cashFiscalTransferPermissions.detail,
          ),
          handle: {
            title: "cash.fiscalTransfer.title",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
  ],
};
