import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import BankOperationListPage from "./pages/statement/screens/BankOperationListPage";
import BankStatementImportPage from "./pages/statement/screens/BankStatementImportPage";
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
  ],
};
