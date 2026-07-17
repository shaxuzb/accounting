import PermissionCard from "@/components/ui/card/PermissionCard";
import { Outlet, type RouteObject } from "react-router";
import { inventoryAdjustmentPermissions } from "./pages/inventory-adjustment/constants/permissions";
import InventoryAdjustmentDetailPage from "./pages/inventory-adjustment/screens/InventoryAdjustmentDetailPage";
import InventoryAdjustmentListPage from "./pages/inventory-adjustment/screens/InventoryAdjustmentListPage";
import { inventoryCountPermissions } from "./pages/inventory-count/constants/permissions";
import InventoryCountDetailPage from "./pages/inventory-count/screens/InventoryCountDetailPage";
import InventoryCountListPage from "./pages/inventory-count/screens/InventoryCountListPage";
import { warehousePermissions } from "./pages/warehouse/constants/permissions";
import ProductSummaryListPage from "./pages/warehouse/screens/ProductSummaryListPage";
import ProductDetail from "./pages/warehouse/screens/ProductDetail";
import { warehouseTransferPermissions } from "./pages/warehouse-transfer/constants/permissions";
import WarehouseTransferDetailPage from "./pages/warehouse-transfer/screens/WarehouseTransferDetailPage";
import WarehouseTransferListPage from "./pages/warehouse-transfer/screens/WarehouseTransferListPage";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const warehouseRoutes: RouteObject = {
  path: "warehouses",
  element: <Outlet />,
  children: [
    {
      path: "warehouse",
      handle: { title: "warehouses.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <ProductSummaryListPage />,
            warehousePermissions.products,
          ),
        },
        {
          path: ":id",
          element: withPermission(<ProductDetail />, warehousePermissions.products),
        },
      ],
    },
    {
      path: "transfers",
      handle: { title: "app.routes.warehouseTransfer" },
      children: [
        {
          index: true,
          element: withPermission(
            <WarehouseTransferListPage />,
            warehouseTransferPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <WarehouseTransferDetailPage />,
            warehouseTransferPermissions.create,
          ),
          handle: { title: "app.routes.newTransfer", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(
            <WarehouseTransferDetailPage />,
            warehouseTransferPermissions.detail,
          ),
          handle: { title: "app.routes.transferDocument", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "inventory-adjustments",
      handle: { title: "app.menu.adjustment" },
      children: [
        {
          index: true,
          element: withPermission(
            <InventoryAdjustmentListPage />,
            inventoryAdjustmentPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <InventoryAdjustmentDetailPage />,
            inventoryAdjustmentPermissions.create,
          ),
          handle: { title: "app.routes.newAdjustment", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(
            <InventoryAdjustmentDetailPage />,
            inventoryAdjustmentPermissions.detail,
          ),
          handle: { title: "app.routes.adjustmentDocument", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "inventory-counts",
      handle: { title: "app.menu.inventory" },
      children: [
        {
          index: true,
          element: withPermission(
            <InventoryCountListPage />,
            inventoryCountPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <InventoryCountDetailPage />,
            inventoryCountPermissions.create,
          ),
          handle: {
            title: "app.routes.newInventory",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id/edit",
          element: withPermission(
            <InventoryCountDetailPage />,
            inventoryCountPermissions.update,
          ),
          handle: {
            title: "app.routes.inventoryEdit",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <InventoryCountDetailPage />,
            inventoryCountPermissions.detail,
          ),
          handle: {
            title: "app.routes.inventoryDocument",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
  ],
};
