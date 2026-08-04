import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { faAssetPermissions } from "./pages/faAsset/constants/permissions";
import { faDisposalPermissions } from "./pages/faDisposal/constants/permissions";
import { faDepreciationPermissions } from "./pages/faDepreciation/constants/permissions";
import { faMovementPermissions } from "./pages/faMovement/constants/permissions";
import { faReceiptPermissions } from "./pages/faReceipt/constants/permissions";
import { faRevaluationPermissions } from "./pages/faRevaluation/constants/permissions";
import FaAssetListPage from "./pages/faAsset/screens/FaAssetListPage";
import FaAssetFormPage from "./pages/faAsset/screens/FaAssetFormPage";
import FaReceiptListPage from "./pages/faReceipt/screens/FaReceiptListPage";
import FaReceiptFormPage from "./pages/faReceipt/screens/FaReceiptFormPage";
import FaMovementListPage from "./pages/faMovement/screens/FaMovementListPage";
import FaMovementFormPage from "./pages/faMovement/screens/FaMovementFormPage";
import FaRevaluationListPage from "./pages/faRevaluation/screens/FaRevaluationListPage";
import FaRevaluationFormPage from "./pages/faRevaluation/screens/FaRevaluationFormPage";
import FaDisposalListPage from "./pages/faDisposal/screens/FaDisposalListPage";
import FaDisposalFormPage from "./pages/faDisposal/screens/FaDisposalFormPage";
import FaDepreciationListPage from "./pages/faDepreciation/screens/FaDepreciationListPage";
import FaDepreciationFormPage from "./pages/faDepreciation/screens/FaDepreciationFormPage";

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
      path: "assets",
      handle: { title: "fa.entities.assets" },
      children: [
        {
          index: true,
          element: withPermission(<FaAssetListPage />, faAssetPermissions.view),
        },
        {
          path: "add",
          element: withPermission(
            <FaAssetFormPage />,
            faAssetPermissions.create,
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
