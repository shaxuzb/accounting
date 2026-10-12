import { lazy } from "react";
import type { RouteObject } from "react-router";
import { Navigate, Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { faAssetPermissions } from "./pages/faAsset/constants/permissions";
import { faDisposalPermissions } from "./pages/faDisposal/constants/permissions";
import { faDepreciationPermissions } from "./pages/faDepreciation/constants/permissions";
import { faMovementPermissions } from "./pages/faMovement/constants/permissions";
import { faReceiptPermissions } from "./pages/faReceipt/constants/permissions";
import { faRevaluationPermissions } from "./pages/faRevaluation/constants/permissions";
import { faCommissioningPermissions } from "./pages/faCommissioning/constants/permissions";
import { faModernizationPermissions } from "./pages/faModernization/constants/permissions";
import { faInventoryPermissions } from "./pages/faInventory/constants";
const FaAssetListPage = lazy(() => import("./pages/faAsset/screens/FaAssetListPage"));
const FaAssetFormPage = lazy(() => import("./pages/faAsset/screens/FaAssetFormPage"));
const FaReceiptListPage = lazy(() => import("./pages/faReceipt/screens/FaReceiptListPage"));
const FaReceiptFormPage = lazy(() => import("./pages/faReceipt/screens/FaReceiptFormPage"));
const FaMovementListPage = lazy(() => import("./pages/faMovement/screens/FaMovementListPage"));
const FaMovementFormPage = lazy(() => import("./pages/faMovement/screens/FaMovementFormPage"));
const FaRevaluationListPage = lazy(() => import("./pages/faRevaluation/screens/FaRevaluationListPage"));
const FaRevaluationFormPage = lazy(() => import("./pages/faRevaluation/screens/FaRevaluationFormPage"));
const FaDisposalListPage = lazy(() => import("./pages/faDisposal/screens/FaDisposalListPage"));
const FaDisposalFormPage = lazy(() => import("./pages/faDisposal/screens/FaDisposalFormPage"));
const FaDepreciationListPage = lazy(() => import("./pages/faDepreciation/screens/FaDepreciationListPage"));
const FaDepreciationFormPage = lazy(() => import("./pages/faDepreciation/screens/FaDepreciationFormPage"));
const FaCommissioningListPage = lazy(() => import("./pages/faCommissioning/screens/FaCommissioningListPage"));
const FaCommissioningFormPage = lazy(() => import("./pages/faCommissioning/screens/FaCommissioningFormPage"));
const FaModernizationListPage = lazy(() => import("./pages/faModernization/FaModernizationListPage"));
const FaModernizationEditorPage = lazy(() => import("./pages/faModernization/FaModernizationEditorPage"));
const FaInventoryListPage = lazy(() => import("./pages/faInventory/FaInventoryListPage"));
const FaInventoryEditorPage = lazy(() => import("./pages/faInventory/FaInventoryEditorPage"));

const withPermission = (
  element: React.ReactElement,
  permission: string | string[],
) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const faRoutes: RouteObject = {
  path: "fa",
  element: <Outlet />,
  handle: { title: "fa.title" },
  children: [
    {
      // 1C «Нематериальные активы»: the asset registry with the intangible ones
      path: "intangibles",
      element: <Navigate to="../assets?assetKindId=2" replace />,
    },
    {
      path: "assets",
      handle: { title: "fa.entities.assets" },
      children: [
        {
          index: true,
          element: withPermission(<FaAssetListPage />, faAssetPermissions.view),
        },
        {
          path: ":id",
          element: withPermission(
            <FaAssetFormPage />,
            faAssetPermissions.detail,
          ),
          handle: {
            title: "fa.form.detail",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <FaAssetFormPage />,
            faAssetPermissions.update,
          ),
          handle: {
            title: "fa.form.edit",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "receipts",
      handle: { title: "fa.entities.receipts" },
      children: [
        {
          index: true,
          element: withPermission(
            <FaReceiptListPage />,
            faReceiptPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <FaReceiptFormPage />,
            faReceiptPermissions.create,
          ),
          handle: {
            title: "fa.form.create",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <FaReceiptFormPage />,
            faReceiptPermissions.detail,
          ),
          handle: {
            title: "fa.form.detail",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <FaReceiptFormPage />,
            faReceiptPermissions.update,
          ),
          handle: {
            title: "fa.form.edit",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "commissionings",
      handle: { title: "fa.entities.commissionings" },
      children: [
        {
          index: true,
          element: withPermission(
            <FaCommissioningListPage />,
            faCommissioningPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <FaCommissioningFormPage />,
            faCommissioningPermissions.create,
          ),
          handle: { title: "fa.form.commissioningCreate", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(
            <FaCommissioningFormPage />,
            faCommissioningPermissions.detail,
          ),
          handle: { title: "fa.form.commissioningDetail", showBack: true, backTo: ".." },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <FaCommissioningFormPage />,
            faCommissioningPermissions.update,
          ),
          handle: { title: "fa.form.commissioningEdit", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "movements",
      handle: { title: "fa.entities.movements" },
      children: [
        {
          index: true,
          element: withPermission(
            <FaMovementListPage />,
            faMovementPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <FaMovementFormPage />,
            faMovementPermissions.create,
          ),
          handle: {
            title: "fa.form.movementCreate",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <FaMovementFormPage />,
            faMovementPermissions.detail,
          ),
          handle: {
            title: "fa.form.movementDetail",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <FaMovementFormPage />,
            faMovementPermissions.update,
          ),
          handle: {
            title: "fa.form.movementEdit",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "revaluations",
      handle: { title: "fa.entities.revaluations" },
      children: [
        {
          index: true,
          element: withPermission(
            <FaRevaluationListPage />,
            faRevaluationPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <FaRevaluationFormPage />,
            faRevaluationPermissions.create,
          ),
          handle: {
            title: "fa.form.revaluationCreate",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <FaRevaluationFormPage />,
            faRevaluationPermissions.detail,
          ),
          handle: {
            title: "fa.form.revaluationDetail",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <FaRevaluationFormPage />,
            faRevaluationPermissions.update,
          ),
          handle: {
            title: "fa.form.revaluationEdit",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "modernizations",
      handle: { title: "fa.modernization.title" },
      children: [
        {
          index: true,
          element: withPermission(<FaModernizationListPage />, faModernizationPermissions.view),
        },
        {
          path: "new",
          element: withPermission(<FaModernizationEditorPage />, faModernizationPermissions.create),
          handle: { title: "fa.modernization.new", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(<FaModernizationEditorPage />, faModernizationPermissions.view),
          handle: { title: "fa.modernization.title", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      // 1C «Инвентаризация ОС» / «Инвентаризация НМА»
      path: "inventories",
      handle: { title: "fa.entities.inventories" },
      children: [
        {
          index: true,
          element: withPermission(<FaInventoryListPage />, faInventoryPermissions.view),
        },
        {
          path: "new",
          element: withPermission(<FaInventoryEditorPage />, faInventoryPermissions.create),
          handle: { title: "fa.inventory.new", showBack: true, backTo: ".." },
        },
        {
          path: ":id",
          element: withPermission(<FaInventoryEditorPage />, faInventoryPermissions.view),
          handle: { title: "fa.inventory.title", showBack: true, backTo: ".." },
        },
      ],
    },
    {
      path: "disposals",
      handle: { title: "fa.entities.disposals" },
      children: [
        {
          index: true,
          element: withPermission(
            <FaDisposalListPage />,
            faDisposalPermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <FaDisposalFormPage />,
            faDisposalPermissions.create,
          ),
          handle: {
            title: "fa.form.disposalCreate",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <FaDisposalFormPage />,
            faDisposalPermissions.detail,
          ),
          handle: {
            title: "fa.form.disposalDetail",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <FaDisposalFormPage />,
            faDisposalPermissions.update,
          ),
          handle: {
            title: "fa.form.disposalEdit",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
    {
      path: "depreciation",
      handle: { title: "fa.entities.depreciation" },
      children: [
        {
          index: true,
          element: withPermission(
            <FaDepreciationListPage />,
            faDepreciationPermissions.view,
          ),
        },
        {
          path: "run",
          element: withPermission(
            <FaDepreciationFormPage />,
            faDepreciationPermissions.create,
          ),
          handle: {
            title: "fa.form.run",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <FaDepreciationFormPage />,
            faDepreciationPermissions.detail,
          ),
          handle: {
            title: "fa.form.detail",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
  ],
};
