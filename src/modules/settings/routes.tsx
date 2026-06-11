import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";
import RoleListPage from "./pages/role/screens/RoleListPage";
import RoleFormPage from "./pages/role/screens/RoleFormPage";
import UsersPage from "./pages/users/screens";
import OrganizationListPage from "./pages/organizations/screens";
import CounterpartyListPage from "./pages/counterparty/screens";
import DepartmentsListPage from "./pages/departments/screens";
import ChartAccountsListPage from "./pages/chartAccounts/screens";
import BranchesListPage from "./pages/branches/screens";
import CounterpartyBankAccountListPage from "./pages/counterpartybankaccount/screens";
import OrgBankAccountstListPage from "./pages/orgBankAccounts/screens";
import PositionstListPage from "./pages/positions/screens";
import ProductGroupsListPage from "./pages/productGroups/screens";
import CashBoxListPage from "./pages/cashbox/screens";
import CounterpartyContactsListPage from "./pages/counterpartycontact/screens";
import WarehousesListPage from "./pages/warehouse/screens";

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "Sozlamalar" },
  children: [
    { index: true, element: <SettingsListPage /> },
    {
      path: "users",
      element: <UsersPage />,
    },
    {
      path: "role",
      handle: { title: "Role" },
      children: [
        { index: true, element: <RoleListPage /> },
        {
          path: "add",
          element: <RoleFormPage />,
          handle: { title: "Add Role", showBack: true, backTo: ".." },
        },
        {
          path: "edit/:id",
          element: <RoleFormPage />,
          handle: { title: "Edit Role", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "organizations",
      handle: { title: "Organizations" },
      element: <OrganizationListPage />,
    },
    {
      path: "counterparty",
      handle: { title: "Counterparty" },
      element: <CounterpartyListPage />,
    },
    {
      path: "departments",
      handle: { title: "Departments" },
      element: <DepartmentsListPage />,
    },
    {
      path: "branches",
      handle: { title: "Branches" },
      element: <BranchesListPage />,
    },
    {
      path: "chart-accounts",
      handle: { title: "Chart Accounts" },
      element: <ChartAccountsListPage />,
    },
    {
      path: "counterparty-bank-accounts",
      handle: { title: "Bank Accounts" },
      element: <CounterpartyBankAccountListPage />,
    },
    {
      path: "org-bank-accounts",
      handle: { title: "Org Bank Accounts" },
      element: <OrgBankAccountstListPage />,
    },
    {
      path: "positions",
      handle: { title: "Positions" },
      element: <PositionstListPage />,
    },
    {
      path: "product-groups",
      handle: { title: "Product Groups" },
      element: <ProductGroupsListPage />,
    },
    {
      path: "cash-boxes",
      handle: { title: " Cash Box" },
      element: <CashBoxListPage />,
    },
    {
      path: "counterparty-contacts",
      handle: { title: " Counterparty contacts" },
      element: <CounterpartyContactsListPage />,
    },
    {
      path: "warehouses",
      handle: { title: " Warehouse" },
      element: <WarehousesListPage />,
    },
  ],
};
