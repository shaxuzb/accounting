import type { RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ContractListPage from "./pages/contracts/screens/ContractListPage";
import ContractAddEditPage from "./pages/contracts/screens/ContractAddEditPage";
import ContractDetailPage from "./pages/contracts/screens/ContractDetailPage";
import { rentalContractPermissions } from "./pages/contracts/constants/permissions";
import AccrualListPage from "./pages/accruals/screens/AccrualListPage";
import AccrualDetailPage from "./pages/accruals/screens/AccrualDetailPage";
import { rentalAccrualPermissions } from "./pages/accruals/constants/permissions";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const rentalRoutes: RouteObject = {
  path: "rentals",
  handle: { title: "rental.title" },
  children: [
    {
      path: "contracts",
      handle: { title: "rental.contracts.title", showBack: true, backTo: ".." },
      children: [
        { index: true, element: withPermission(<ContractListPage />, rentalContractPermissions.view) },
        { path: "add", element: withPermission(<ContractAddEditPage />, rentalContractPermissions.create), handle: { title: "rental.contracts.create", showBack: true, backTo: ".." } },
        { path: "edit/:id", element: withPermission(<ContractAddEditPage />, rentalContractPermissions.update), handle: { title: "rental.contracts.edit", showBack: true, backTo: ".." } },
        { path: ":id", element: withPermission(<ContractDetailPage />, rentalContractPermissions.detail), handle: { title: "rental.contracts.detail", showBack: true, backTo: "..", tabSuffix: "id" } },
      ],
    },
    {
      path: "accruals",
      handle: { title: "rental.accruals.title", showBack: true, backTo: ".." },
      children: [
        { index: true, element: withPermission(<AccrualListPage />, rentalAccrualPermissions.view) },
        { path: ":id", element: withPermission(<AccrualDetailPage />, rentalAccrualPermissions.detail), handle: { title: "rental.accruals.detail", showBack: true, backTo: "..", tabSuffix: "id" } },
      ],
    },
  ],
};
