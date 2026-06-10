import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";
import RoleListPage from "./pages/role";
import RoleAddPage from "./pages/role/add";
import Users from "./pages/users";
import OrganizationListPage from "./pages/organizations";
import CounterpartyListPage from "./pages/counterparty";
import DepartmentsListPage from "./pages/departments";
import ChartAccountsListPage from "./pages/chartAccounts";
import BranchesListPage from "./pages/branches";
import CounterpartyBankAccountListPage from "./pages/counterpartybankaccount";
import OrgBankAccountstListPage from "./pages/orgBankAccounts";
import PositionstListPage from "./pages/positions";

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "Sozlamalar" },
  children: [
    { index: true, element: <SettingsListPage /> },
    {
      path: "users",
      element: <Users />,
    },
    // { path: "add", element: <SettingsAddPage />, handle: { title: "Add Settings", showBack: true, backTo: ".." } },
    // { path: ":id", element: <SettingsViewPage />, handle: { title: "View Settings", showBack: true, backTo: ".." } },
    {
      path: "role",
      handle: { title: "Role" },
      children: [
        { index: true, element: <RoleListPage /> },
        {
          path: "add",
          element: <RoleAddPage />,
          handle: { title: "Add Role", showBack: true, backTo: ".." },
        },
        {
          path: "edit/:id",
          element: <RoleAddPage />,
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
      handle: { title: "Chartaccounts" },
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
      element: <PositionstListPage   />,
    },
  ],
};
