import { createBrowserRouter } from "react-router";
import { MainLayout, ProtectAuthLayout } from "@/app/layouts";
import { authRoutes } from "@/modules/auth";
import { settingsRoutes } from "@/modules/settings";
import { purchaseRoutes } from "@/modules/purchase/pages/purchase";
import { accountingsRoutes } from "@/modules/accountings";
import { saleRoutes } from "@/modules/sale";
import { productsRoutes } from "@/modules/warehouse/pages/products/routes";
import { warehouseRoutes } from "@/modules/warehouse";
import { bankRoutes } from "@/modules/bank";
import { cashOperationRoutes } from "@/modules/cashoperation";
import { accountingRoutes } from "@/modules/accounting/routes";
import { faRoutes } from "@/modules/fa";
import { payrollRoutes } from "@/modules/payroll";

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
          productsRoutes,
          purchaseRoutes,
          bankRoutes,
          cashOperationRoutes,
          saleRoutes,
          faRoutes,
          payrollRoutes,
          accountingsRoutes,
          accountingRoutes,
          settingsRoutes,
          warehouseRoutes,
        ],
      },
    ],
  },
]);
