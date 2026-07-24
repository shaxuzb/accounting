import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SettingsListPage from "./pages/SettingsListPage";
import RoleListPage from "./pages/role/screens/RoleListPage";
import RoleAddEditPage from "./pages/role/screens/RoleAddEditPage";
import UserListPage from "./pages/users/screens/UserListPage";
import OrganizationListPage from "./pages/organizations/screens/OrganizationListPage";
import CounterpartyListPage from "./pages/counterparty/screens/CounterpartyListPage";
import DepartmentListPage from "./pages/departments/screens/DepartmentListPage";
import ChartAccountListPage from "./pages/chartAccounts/screens/ChartAccountListPage";
import DocumentAccountSettingsListPage from "./pages/documentAccountSettings/screens/DocumentAccountSettingsListPage";
import DocumentAccountSettingsDetailPage from "./pages/documentAccountSettings/screens/DocumentAccountSettingsDetailPage";
import BranchListPage from "./pages/branches/screens/BranchListPage";
import CounterpartyBankAccountListPage from "./pages/counterpartybankaccount/screens/CounterpartyBankAccountListPage";
import SettingsBankListPage from "./pages/bank/screens/SettingsBankListPage";
import OrgBankAccountListPage from "./pages/orgBankAccounts/screens/OrgBankAccountListPage";
import PositionListPage from "./pages/positions/screens/PositionListPage";
import ProductGroupListPage from "./pages/productGroups/screens/ProductGroupListPage";
import CashBoxListPage from "./pages/cashbox/screens/CashBoxListPage";
import CounterpartyContactListPage from "./pages/counterpartycontact/screens/CounterpartyContactListPage";
import WarehouseListPage from "./pages/warehouse/screens/WarehouseListPage";
import PurchaseServiceListPage from "./pages/purchaseService/screens/PurchaseServiceListPage";
import PricingConditionListPage from "./pages/pricingCondition/screens/PricingConditionListPage";
import SaleConditionListPage from "./pages/saleCondition/screens/SaleConditionListPage";
import { rolePermissions } from "./pages/role/constants/permissions";
import { userPermissions } from "./pages/users/constants/permissions";
import { organizationsPermissions } from "./pages/organizations/constants/permissions";
import { counterpartyPermissions } from "./pages/counterparty/constants/permissions";
import { departmentsPermissions } from "./pages/departments/constants/permissions";
import { branchesPermissions } from "./pages/branches/constants/permissions";
import { chartAccountsPermissions } from "./pages/chartAccounts/constants/permissions";
import { counterpartybankaccountPermissions } from "./pages/counterpartybankaccount/constants/permissions";
import { settingsBankPermissions } from "./pages/bank/constants/permissions";
import { orgBankAccountsPermissions } from "./pages/orgBankAccounts/constants/permissions";
import { positionsPermissions } from "./pages/positions/constants/permissions";
import { productGroupsPermissions } from "./pages/productGroups/constants/permissions";
import { cashBoxPermissions } from "./pages/cashbox/constants/permissions";
import { counterpartyContactPermissions } from "./pages/counterpartycontact/constants/permissions";
import { warehousePermissions } from "./pages/warehouse/constants/permissions";
import { purchaseServicePermissions } from "./pages/purchaseService/constants/permissions";
import { pricingConditionPermissions } from "./pages/pricingCondition/constants/permissions";
import { saleConditionPermissions } from "./pages/saleCondition/constants/permissions";
import { purchasePermissions } from "../purchase/pages/purchase/constants/permissions";
import { bankPermissions } from "../bank";
import OpeningBalancePage from "./pages/openingBalance/screens/OpeningBalancePage";
import OpeningBalanceAccountPage from "./pages/openingBalance/screens/OpeningBalanceAccountPage";
import { openingBalancePermissions } from "./pages/openingBalance/constants/permissions";

const settingsPermissions = [
  rolePermissions.view,
  userPermissions.view,
  organizationsPermissions.view,
  counterpartyPermissions.view,
  departmentsPermissions.view,
  branchesPermissions.view,
  chartAccountsPermissions.view,
  settingsBankPermissions.view,
  bankPermissions.view,
  counterpartybankaccountPermissions.view,
  orgBankAccountsPermissions.view,
  positionsPermissions.view,
  productGroupsPermissions.view,
  cashBoxPermissions.view,
  counterpartyContactPermissions.view,
  warehousePermissions.view,
  purchaseServicePermissions.view,
  purchasePermissions.view,
  pricingConditionPermissions.view,
  saleConditionPermissions.view,
  openingBalancePermissions.view,
];

const withPermission = (
  element: React.ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "settings.title" },
  children: [
    {
      index: true,
      element: withPermission(<SettingsListPage />, settingsPermissions),
    },
    {
      path: "users",
      handle: {
        title: "settings.entities.users",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<UserListPage />, userPermissions.view),
    },
    {
      path: "role",
      handle: { title: "settings.entities.role", showBack: true, backTo: ".." },
      children: [
        {
          index: true,
          element: withPermission(<RoleListPage />, rolePermissions.view),
        },
        {
          path: "add",
          element: withPermission(<RoleAddEditPage />, rolePermissions.create),
          handle: {
            title: "settings.form.createRole",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(<RoleAddEditPage />, rolePermissions.update),
          handle: {
            title: "settings.form.editRole",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "organizations",
      handle: {
        title: "settings.entities.organizations",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <OrganizationListPage />,
        organizationsPermissions.view,
      ),
    },
    {
      path: "counterparty",
      handle: {
        title: "settings.entities.counterparty",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <CounterpartyListPage />,
        counterpartyPermissions.view,
      ),
    },
    {
      path: "departments",
      handle: {
        title: "settings.entities.departments",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <DepartmentListPage />,
        departmentsPermissions.view,
      ),
    },
    {
      path: "branches",
      handle: {
        title: "settings.entities.branches",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<BranchListPage />, branchesPermissions.view),
    },
    {
      path: "chart-accounts",
      handle: {
        title: "settings.entities.chartAccounts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <ChartAccountListPage />,
        chartAccountsPermissions.view,
      ),
    },
    {
      path: "document-account-settings",
      handle: {
        title: "settings.entities.documentAccountSettings",
        showBack: true,
        backTo: "..",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <DocumentAccountSettingsListPage />,
            chartAccountsPermissions.view,
          ),
        },
        {
          path: ":documentTypeId",
          handle: {
            title: "settings.entities.documentAccountSettings",
            showBack: true,
            backTo: "..",
          },
          element: withPermission(
            <DocumentAccountSettingsDetailPage />,
            chartAccountsPermissions.view,
          ),
        },
      ],
    },
    {
      path: "opening-balances",
      handle: {
        title: "openingBalance.title",
        showBack: true,
        backTo: "..",
      },
      children: [
        {
          index: true,
          element: withPermission(
            <OpeningBalancePage />,
            openingBalancePermissions.view,
          ),
        },
        {
          path: ":id/accounts/:accountId",
          handle: {
            title: "openingBalance.accountDetail",
            showBack: true,
            backTo: "../../..",
          },
          element: withPermission(
            <OpeningBalanceAccountPage />,
            openingBalancePermissions.view,
          ),
        },
      ],
    },
    {
      path: "banks",
      handle: {
        title: "settings.entities.banks",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<SettingsBankListPage />, [
        settingsBankPermissions.view,
        bankPermissions.view,
      ]),
    },
    {
      path: "counterparty-bank-accounts",
      handle: {
        title: "settings.entities.bankAccounts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <CounterpartyBankAccountListPage />,
        counterpartybankaccountPermissions.view,
      ),
    },
    {
      path: "org-bank-accounts",
      handle: {
        title: "settings.entities.orgBankAccounts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <OrgBankAccountListPage />,
        orgBankAccountsPermissions.view,
      ),
    },
    {
      path: "positions",
      handle: {
        title: "settings.entities.positions",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<PositionListPage />, positionsPermissions.view),
    },
    {
      path: "product-groups",
      handle: {
        title: "settings.entities.productGroups",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <ProductGroupListPage />,
        productGroupsPermissions.view,
      ),
    },
    {
      path: "cash-boxes",
      handle: {
        title: "settings.entities.cashBox",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<CashBoxListPage />, cashBoxPermissions.view),
    },
    {
      path: "counterparty-contacts",
      handle: {
        title: "settings.entities.counterpartyContacts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <CounterpartyContactListPage />,
        counterpartyContactPermissions.view,
      ),
    },
    {
      path: "warehouses",
      handle: {
        title: "settings.entities.warehouse",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<WarehouseListPage />, warehousePermissions.view),
    },
    {
      path: "purchase-services",
      handle: {
        title: "settings.entities.purchaseServices",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<PurchaseServiceListPage />, [
        purchaseServicePermissions.view,
        purchasePermissions.view,
      ]),
    },
    {
      path: "bank",
      handle: {
        title: "settings.entities.counterpartyContacts",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(<SettingsBankListPage />, bankPermissions.view),
    },
    {
      path: "pricing-conditions",
      handle: {
        title: "settings.entities.pricingConditions",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <PricingConditionListPage />,
        pricingConditionPermissions.view,
      ),
    },
    {
      path: "sale-conditions",
      handle: {
        title: "settings.entities.saleConditions",
        showBack: true,
        backTo: "..",
      },
      element: withPermission(
        <SaleConditionListPage />,
        saleConditionPermissions.view,
      ),
    },
  ],
};
