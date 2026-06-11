import type { RouteObject } from "react-router";
// import PurchaseListPage from "./pages/purchase";
// import PurchaseAddPage from "./pages/purchase/add";
// import PurchaseViewPage from "./pages/purchase/view";
/* modux:imports */

export const purchaseRoutes: RouteObject = {
  path: "purchase",
  handle: { title: "Purchase" },
  // children: [
  //   { index: true, element: <PurchaseListPage /> },
  //   { path: "add", element: <PurchaseAddPage />, handle: { title: "Add Purchase", showBack: true, backTo: ".." } },
  //   { path: ":id", element: <PurchaseViewPage />, handle: { title: "View Purchase", showBack: true, backTo: ".." } },
  //   /* modux:routes */
  // ],
};
