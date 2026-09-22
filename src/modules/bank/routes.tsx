import { lazy } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const BankOperationListPage = lazy(() => import("./pages/statement/screens/BankOperationListPage"));
const BankStatementImportPage = lazy(() => import("./pages/statement/screens/BankStatementImportPage"));
const BankOperationAddEditPage = lazy(() => import("./pages/statement/screens/BankOperationAddEditPage"));
const BankOperationDetailPage = lazy(() => import("./pages/statement/screens/BankOperationDetailPage"));
import { bankPermissions } from "./pages/statement/constants/permissions";

const withPermission = (
  element: React.ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const bankRoutes: RouteObject = {
  path: "bank",
  handle: { title: "bank.title" },
  children: [
    {
      index: true,
      element: withPermission(<BankOperationListPage />, [
        bankPermissions.view,
        "ROLE_VIEW",
      ]),
    },
    {
      path: "import",
      element: withPermission(<BankStatementImportPage />, [
        bankPermissions.create,
        "ROLE_VIEW",
      ]),
      handle: {
        title: "bank.statementImport",
        showBack: true,
        backTo: "..",
      },
    },
    {
      path: "add",
      element: withPermission(<BankOperationAddEditPage />, [
        bankPermissions.create,
        "ROLE_VIEW",
      ]),
      handle: {
        title: "settings.form.createTitle",
        showBack: true,
        backTo: "..",
      },
    },
    {
      path: "edit/:id",
      element: withPermission(<BankOperationAddEditPage />, [
        bankPermissions.update,
        "ROLE_VIEW",
      ]),
      handle: {
        title: "bank.title",
        showBack: true,
        backTo: "..",
      },
    },
    {
      path: ":id",
      element: withPermission(<BankOperationDetailPage />, [
        bankPermissions.detail,
        bankPermissions.view,
        "ROLE_VIEW",
      ]),
      handle: {
        title: "bank.title",
        showBack: true,
        backTo: "..",
      },
    },
  ],
};
