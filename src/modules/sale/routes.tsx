import { lazy } from "react";
import { Outlet, type RouteObject } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
const SaleAddEditPage = lazy(() => import("./pages/sale/screens/SaleAddEditPage"));
const SaleDetailPage = lazy(() => import("./pages/sale/screens/SaleDetailPage"));
const SaleListPage = lazy(() => import("./pages/sale/screens/SaleListPage"));
import { salePermissions } from "./pages/sale/constants/permissions";
const ContractListPage = lazy(() => import("../contract/screens/ContractListPage"));
import { contractPermissions } from "../contract/constants/permissions";
import { returnRoute } from "../returns/routes";
import { returnKind } from "../returns/constants";
import { correctionRoute } from "../corrections/routes";
import { commissionReportRoute } from "../commissionReport/routes";
import { commissionReportKinds } from "../commissionReport/api";
const RetailSaleDetailPage = lazy(() => import("./pages/retail-sale").then((m) => ({ default: m.RetailSaleDetailPage })));
const RetailSaleEditorPage = lazy(() => import("./pages/retail-sale").then((m) => ({ default: m.RetailSaleEditorPage })));
const RetailSaleListPage = lazy(() => import("./pages/retail-sale").then((m) => ({ default: m.RetailSaleListPage })));
import { retailSalePermissions } from "./pages/retail-sale/constants/permissions";
const SaleInvoiceListPage = lazy(() => import("../saleInvoice/SaleInvoiceListPage"));
const SaleInvoiceEditorPage = lazy(() => import("../saleInvoice/SaleInvoiceEditorPage"));
const SaleInvoicePrintPage = lazy(() => import("../saleInvoice/SaleInvoicePrintPage"));
import { saleInvoicePermissions } from "../saleInvoice/api";

const withPermission = (element: React.ReactElement, permission: string) => (
  <PermissionCard permission={permission} mode="redirect">
    {element}
  </PermissionCard>
);

export const saleRoutes: RouteObject = {
  path: "sales",
  element: <Outlet />,
  children: [
    {
      path: "sale",
      handle: { title: "sale.title" },
      children: [
        {
          index: true,
          element: withPermission(<SaleListPage />, salePermissions.view),
        },
        {
          path: "add",
          element: withPermission(<SaleAddEditPage />, salePermissions.create),
          handle: { title: "sale.new", showBack: true, backTo: ".." },
        },
        {
          path: "edit/:id",
          element: withPermission(<SaleAddEditPage />, salePermissions.update),
          handle: { title: "sale.edit", showBack: true, backTo: "../.." },
        },
        {
          path: ":id",
          element: withPermission(<SaleDetailPage />, salePermissions.detail),
          handle: { title: "sale.document", showBack: true, backTo: ".." },
        },
      ],
    },
    // invoices for payment (1C «Счет на оплату покупателю»)
    {
      path: "invoices",
      handle: { title: "saleInvoice.title" },
      children: [
        { index: true, element: withPermission(<SaleInvoiceListPage />, saleInvoicePermissions.view) },
        {
          path: "new",
          handle: { title: "saleInvoice.new", showBack: true, backTo: ".." },
          element: withPermission(<SaleInvoiceEditorPage />, saleInvoicePermissions.create),
        },
        {
          path: ":id",
          handle: { title: "saleInvoice.document", showBack: true, backTo: ".." },
          element: withPermission(<SaleInvoiceEditorPage />, saleInvoicePermissions.view),
        },
        {
          path: ":id/print",
          handle: { title: "saleInvoice.print", showBack: true, backTo: ".." },
          element: withPermission(<SaleInvoicePrintPage />, saleInvoicePermissions.view),
        },
      ],
    },
    // returns from customers (1C «Возврат товаров от покупателя», «… от розничного покупателя»)
    returnRoute(returnKind.fromCustomer, "sale-returns"),
    returnRoute(returnKind.fromRetail, "retail-returns"),
    // the price of a posted sale agreed again, a discount after the sale (1C «Корректировка реализации»)
    correctionRoute("sale", "corrections"),
    // our commission agents' fee (1C «Отчет комиссионера о продажах»); their sales are sales from
    // the commission warehouse
    commissionReportRoute(commissionReportKinds.fromAgent, "commission-reports"),
    {
      path: "contracts",
      handle: { title: "contract.saleTitle" },
      element: withPermission(
        <ContractListPage />,
        contractPermissions.view,
      ),
    },
    {
      path: "retail-sale",
      handle: { title: "retailSale.title" },
      children: [
        {
          index: true,
          element: withPermission(
            <RetailSaleListPage />,
            retailSalePermissions.view,
          ),
        },
        {
          path: "add",
          element: withPermission(
            <RetailSaleEditorPage />,
            retailSalePermissions.create,
          ),
          handle: {
            title: "retailSale.new",
            showBack: true,
            backTo: "..",
          },
        },
        {
          path: "edit/:id",
          element: withPermission(
            <RetailSaleEditorPage />,
            retailSalePermissions.update,
          ),
          handle: {
            title: "retailSale.edit",
            showBack: true,
            backTo: "../..",
          },
        },
        {
          path: ":id",
          element: withPermission(
            <RetailSaleDetailPage />,
            retailSalePermissions.detail,
          ),
          handle: {
            title: "retailSale.document",
            showBack: true,
            backTo: "..",
          },
        },
      ],
    },
  ],
};
