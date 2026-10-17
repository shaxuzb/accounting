import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { purchasePermissions } from "./pages/purchase/constants/permissions";
const PurchaseListPage = lazy(() => import("./pages/purchase/screens/PurchaseListPage"));
const PurchaseDetailPage = lazy(() => import("./pages/purchase/screens/PurchaseDetailPage"));
const ContractListPage = lazy(() => import("../contract/screens/ContractListPage"));
import { commissionReportRoute } from "../commissionReport/routes";
import { commissionReportKinds } from "../commissionReport/api";
const PowerOfAttorneyListPage = lazy(() => import("../powerOfAttorney/PowerOfAttorneyListPage"));
const PowerOfAttorneyEditorPage = lazy(() => import("../powerOfAttorney/PowerOfAttorneyEditorPage"));
const PowerOfAttorneyPrintPage = lazy(() => import("../powerOfAttorney/PowerOfAttorneyPrintPage"));
import { powerOfAttorneyPermissions } from "../powerOfAttorney/api";
import { contractPermissions } from "../contract/constants/permissions";
import { returnRoute } from "../returns/routes";
import { returnKind } from "../returns/constants";
import { extraCostRoute } from "../extraCosts/routes";
import { correctionRoute } from "../corrections/routes";
import { customsRoute } from "../customs/routes";
const PurchaseEditor = lazy(() => import("./pages/purchase/screens/PurchaseEditorPage"));


const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const purchaseRoutes: RouteObject = {
  path: "purchases",
  element: <Outlet />,
  children: [
    {
      path: "purchase",
      handle: { title: "purchase.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <PurchaseListPage />,
            purchasePermissions.view,
          ),
        },
        {
          path: "import",
          element: withPermission(
            <PurchaseEditor />,
            purchasePermissions.create,
          ),
          handle: {
            title: "purchase.importTitle",
            showBack: true,
            backTo: "..",
            tabSuffix: "docNumber",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <PurchaseEditor />,
            purchasePermissions.update,
          ),
          handle: {
            title: "purchase.detailTitle",
            showBack: true,
            backTo: "..",
            tabSuffix: "docNumber",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <PurchaseDetailPage />,
            purchasePermissions.detail,
          ),
          handle: {
            title: "purchase.detailTitle",
            showBack: true,
            backTo: "..",
            tabSuffix: "docNumber",
          },
        },
      ],
    },
    // returns to suppliers (1C «Возврат товаров поставщику»)
    returnRoute(returnKind.toSupplier, "purchase-returns"),
    // additional costs put on purchased goods (1C «Поступление доп. расходов»)
    extraCostRoute("extra-costs"),
    // the price of a posted purchase agreed again (1C «Корректировка поступления»)
    correctionRoute("purchase", "corrections"),
    // customs declarations of imports (1C «Таможенная декларация (импорт)»)
    customsRoute("customs-declarations"),
    // our fee from committents (1C «Отчет комитенту о продажах»)
    commissionReportRoute(commissionReportKinds.toCommittent, "committent-reports"),
    {
      // 1C «Доверенности» (NSBU 4 ch. 12)
      path: "powers-of-attorney",
      handle: { title: "powerOfAttorney.title" },
      children: [
        { index: true, element: withPermission(<PowerOfAttorneyListPage />, powerOfAttorneyPermissions.view) },
        {
          path: "new",
          handle: { title: "powerOfAttorney.new", showBack: true, backTo: ".." },
          element: withPermission(<PowerOfAttorneyEditorPage />, powerOfAttorneyPermissions.create),
        },
        {
          path: ":id",
          handle: { title: "powerOfAttorney.document", showBack: true, backTo: ".." },
          element: withPermission(<PowerOfAttorneyEditorPage />, powerOfAttorneyPermissions.view),
        },
        {
          path: ":id/print",
          handle: { title: "powerOfAttorney.print", showBack: true, backTo: ".." },
          element: withPermission(<PowerOfAttorneyPrintPage />, powerOfAttorneyPermissions.view),
        },
      ],
    },
    {
      path: "contracts",
      handle: { title: "contract.purchaseTitle" },
      element: withPermission(
        <ContractListPage />,
        contractPermissions.view,
      ),
    },
  ],
};
