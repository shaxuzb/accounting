import { createBrowserRouter } from "react-router";
import { MainLayout, ProtectAuthLayout } from "@/app/layouts";
import { authRoutes } from "@/modules/auth";
import { settingsRoutes } from "@/modules/settings";
import { dashboardRoutes } from "@/modules/dashboard/routes";
import { productsRoutes } from "@/modules/products";
import { purchaseRoutes } from "@/modules/purchase/pages/purchase";
import { accountingRoutes } from "@/modules/accounting";
import { saleRoutes } from "@/modules/sale";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectAuthLayout />,

    children: [
      authRoutes,

      {
        path: "main",
        element: <MainLayout />,
        children: [
          dashboardRoutes,
          productsRoutes,
          purchaseRoutes,
          saleRoutes,
          accountingRoutes,
          settingsRoutes,
        ],
      },
    ],
  },
]);
