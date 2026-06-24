import { createBrowserRouter } from "react-router";
import { MainLayout, ProtectAuthLayout } from "@/app/layouts";
import { authRoutes } from "@/modules/auth";
import { settingsRoutes } from "@/modules/settings";
import { dashboardRoutes } from "@/modules/dashboard/routes";
import { purchaseRoutes } from "@/modules/purchase/pages/purchase";
import { accountingRoutes } from "@/modules/accounting";
import { saleRoutes } from "@/modules/sale";
import { productsRoutes } from "@/modules/warehouse/pages/products/routes";
import { warehouseRoutes } from "@/modules/warehouse";
import { bankRoutes } from "@/modules/bank";

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
          bankRoutes,
          saleRoutes,
          accountingRoutes,
          settingsRoutes,
          warehouseRoutes,
        ],
      },
    ],
  },
]);
