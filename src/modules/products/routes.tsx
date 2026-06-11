import type { RouteObject } from "react-router";
import ProductsListPage from "./pages/products";
import ProductsAddPage from "./pages/products/add";
import ProductsViewPage from "./pages/products/view";
/* modux:imports */

export const productsRoutes: RouteObject = {
  path: "products",
  handle: { title: "Products" },
  children: [
    { index: true, element: <ProductsListPage /> },
    { path: "add", element: <ProductsAddPage />, handle: { title: "Add Products", showBack: true, backTo: ".." } },
    { path: ":id", element: <ProductsViewPage />, handle: { title: "View Products", showBack: true, backTo: ".." } },
    /* modux:routes */
  ],
};
