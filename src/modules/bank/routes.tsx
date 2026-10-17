import { lazy } from "react";
import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const BankOperationListPage = lazy(() => import("./pages/statement/screens/BankOperationListPage"));
const BankStatementImportPage = lazy(() => import("./pages/statement/screens/BankStatementImportPage"));
const BankOperationAddEditPage = lazy(() => import("./pages/statement/screens/BankOperationAddEditPage"));
const BankOperationDetailPage = lazy(() => import("./pages/statement/screens/BankOperationDetailPage"));
const PaymentOrderPrintPage = lazy(() => import("./pages/payment-order/PaymentOrderPrintPage"));
import { bankPermissions } from "./pages/statement/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
const ContractListPage = lazy(() => import("../contract/screens/ContractListPage"));

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
      // credit and loan contracts (1C «Договоры» of credits and loans), kept by 68xx / 78xx
      path: "loan-contracts",
      handle: { title: "contract.loanTitle" },
      element: withPermission(<ContractListPage />, contractPermissions.view),
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
      path: ":id/payment-order",
      element: withPermission(<PaymentOrderPrintPage />, [
        bankPermissions.detail,
        bankPermissions.view,
        "ROLE_VIEW",
      ]),
      handle: { title: "paymentOrder.print", showBack: true, backTo: ".." },
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
