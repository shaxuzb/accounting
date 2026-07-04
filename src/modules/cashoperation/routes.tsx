import type { ReactElement } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { cashOperationPermissions } from "./pages/cashoperation/constants/permissions";
import { cashDocumentPermissions } from "./pages/cash-document/constants/permissions";
import { cashBookPermissions } from "./pages/cash-book/constants/permissions";
import CashOperationDetailPage from "./pages/cashoperation/screens/CashOperationDetailPage";
import CashOperationListPage from "./pages/cashoperation/screens/CashOperationListPage";
import CashDocumentListPage from "./pages/cash-document/screens/CashDocumentListPage";
import CashDocumentDetailPage from "./pages/cash-document/screens/CashDocumentDetailPage";
import CashBookListPage from "./pages/cash-book/screens/CashBookListPage";
import CashBookDetailPage from "./pages/cash-book/screens/CashBookDetailPage";
import { getCashDocumentLabels } from "./pages/cash-document/utils/kind";

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
  handle: { title: "Kassa" },
  element: <Outlet />,
  children: [
    {
      path: "cash-operations",
      handle: { title: "Kassa" },
      children: [
        {
          index: true,
          element: withPermission(
            <CashOperationListPage />,
            cashOperationPermissions.view,
          ),
        },
        {
          path: ":id",
          element: withPermission(
            <CashOperationDetailPage />,
            cashOperationPermissions.detail,
          ),
          handle: { title: "Kassa hujjati", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "cash-documents/:kind",
      handle: { title: "Kassa hujjatlari" },
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
            title: getCashDocumentLabels("pko").addTitle,
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
            title: getCashDocumentLabels("pko").detailTitle,
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "cash-book",
      handle: { title: "Kassa hisobi" },
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
          handle: { title: "Kassa hisobi", showBack: true, backTo: ".." },
        },
      ],
    },
  ],
};
