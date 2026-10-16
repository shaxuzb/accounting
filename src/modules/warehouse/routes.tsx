import { lazy } from "react";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { Outlet, type RouteObject } from "react-router";
import { inventoryAdjustmentPermissions } from "./pages/inventory-adjustment/constants/permissions";
const InventoryAdjustmentDetailPage = lazy(() => import("./pages/inventory-adjustment/screens/InventoryAdjustmentDetailPage"));
const InventoryAdjustmentListPage = lazy(() => import("./pages/inventory-adjustment/screens/InventoryAdjustmentListPage"));
import { inventoryCountPermissions } from "./pages/inventory-count/constants/permissions";
const InventoryCountDetailPage = lazy(() => import("./pages/inventory-count/screens/InventoryCountDetailPage"));
const InventoryCountListPage = lazy(() => import("./pages/inventory-count/screens/InventoryCountListPage"));
import { warehousePermissions } from "./pages/warehouse/constants/permissions";
const ProductSummaryListPage = lazy(() => import("./pages/warehouse/screens/ProductSummaryListPage"));
const ProductDetail = lazy(() => import("./pages/warehouse/screens/ProductDetail"));
import { warehouseTransferPermissions } from "./pages/warehouse-transfer/constants/permissions";
const WarehouseTransferDetailPage = lazy(() => import("./pages/warehouse-transfer/screens/WarehouseTransferDetailPage"));
const WarehouseTransferListPage = lazy(() => import("./pages/warehouse-transfer/screens/WarehouseTransferListPage"));

const PriceTypeListPage = lazy(() => import("../priceType/PriceTypeListPage"));
const PriceSettingListPage = lazy(() =>
  import("../priceType/PriceSettingPages").then((m) => ({ default: m.PriceSettingListPage })),
);
const PriceSettingEditorPage = lazy(() =>
  import("../priceType/PriceSettingPages").then((m) => ({ default: m.PriceSettingEditorPage })),
);
const RetailRevaluationListPage = lazy(() =>
  import("./pages/retail-revaluation/RetailRevaluationPages").then((m) => ({ default: m.RetailRevaluationListPage })),
);
const RetailRevaluationEditorPage = lazy(() =>
  import("./pages/retail-revaluation/RetailRevaluationPages").then((m) => ({ default: m.RetailRevaluationEditorPage })),
);

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
          element: withPermission(
            <ProductDetail />,
            warehousePermissions.products,
          ),
          handle: { title: "warehouses.title", showBack: true, backTo: ".." },
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
          handle: {
            title: "app.routes.newTransfer",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <WarehouseTransferDetailPage />,
            warehouseTransferPermissions.detail,
          ),
          handle: {
            title: "app.routes.transferDocument",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      // 1C «Типы цен номенклатуры»
      path: "price-types",
      handle: { title: "priceType.title" },
      element: withPermission(<PriceTypeListPage />, "PRICE_TYPE_VIEW"),
    },
    {
      // 1C «Установка цен номенклатуры»
      path: "price-settings",
      handle: { title: "priceSetting.title" },
      children: [
        { index: true, element: withPermission(<PriceSettingListPage />, "PRICE_SETTING_VIEW") },
        {
          path: "new",
          element: withPermission(<PriceSettingEditorPage />, "PRICE_SETTING_CREATE"),
          handle: { title: "priceSetting.new", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(<PriceSettingEditorPage />, "PRICE_SETTING_VIEW"),
          handle: { title: "priceSetting.document", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      // 1C «Переоценка товаров в рознице»
      path: "retail-revaluations",
      handle: { title: "retailRevaluation.title" },
      children: [
        { index: true, element: withPermission(<RetailRevaluationListPage />, "RETAIL_REVALUATION_VIEW") },
        {
          path: "add",
          element: withPermission(<RetailRevaluationEditorPage />, "RETAIL_REVALUATION_CREATE"),
          handle: { title: "retailRevaluation.title", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(<RetailRevaluationEditorPage />, "RETAIL_REVALUATION_VIEW"),
          handle: { title: "retailRevaluation.title", showBack: true, backTo: ".." },
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
          handle: {
            title: "app.routes.newAdjustment",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <InventoryAdjustmentDetailPage />,
            inventoryAdjustmentPermissions.detail,
          ),
          handle: {
            title: "app.routes.adjustmentDocument",
            showBack: true,
            backTo: "..",
          },
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
