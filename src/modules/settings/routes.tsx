import type { RouteObject } from "react-router";
import SettingsListPage from "./pages";
import RoleListPage from "./pages/role/screens/RoleListPage";
import RoleAddEditPage from "./pages/role/screens/RoleAddEditPage";
import UserListPage from "./pages/users/screens/UserListPage";
import OrganizationListPage from "./pages/organizations/screens/OrganizationListPage";
import CounterpartyListPage from "./pages/counterparty/screens/CounterpartyListPage";
import DepartmentListPage from "./pages/departments/screens/DepartmentListPage";
import ChartAccountListPage from "./pages/chartAccounts/screens/ChartAccountListPage";
import BranchListPage from "./pages/branches/screens/BranchListPage";
import CounterpartyBankAccountListPage from "./pages/counterpartybankaccount/screens/CounterpartyBankAccountListPage";
import OrgBankAccountListPage from "./pages/orgBankAccounts/screens/OrgBankAccountListPage";
import PositionListPage from "./pages/positions/screens/PositionListPage";
import ProductGroupListPage from "./pages/productGroups/screens/ProductGroupListPage";

export const settingsRoutes: RouteObject = {
  path: "settings",
  handle: { title: "Sozlamalar" },
  children: [
    { index: true, element: <SettingsListPage /> },
    {
      path: "users",
      element: <UserListPage />,
    },
    {
      path: "role",
      handle: { title: "Role" },
      children: [
        { index: true, element: <RoleListPage /> },
        {
          path: "add",
          element: <RoleAddEditPage />,
          handle: { title: "Add Role", showBack: true, backTo: ".." },
        },
        {
          path: "edit/:id",
          element: <RoleAddEditPage />,
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
      element: <DepartmentListPage />,
    },
    {
      path: "branches",
      handle: { title: "Branches" },
      element: <BranchListPage />,
    },
    {
      path: "chart-accounts",
      handle: { title: "Chart Accounts" },
      element: <ChartAccountListPage />,
    },
    {
      path: "counterparty-bank-accounts",
      handle: { title: "Bank Accounts" },
      element: <CounterpartyBankAccountListPage />,
    },
    {
      path: "org-bank-accounts",
      handle: { title: "Org Bank Accounts" },
      element: <OrgBankAccountListPage />,
    },
    {
      path: "positions",
      handle: { title: "Positions" },
      element: <PositionListPage />,
    },
    {
      path: "product-groups",
      handle: { title: "Product Groups" },
      element: <ProductGroupListPage />,
    },
  ],
};
