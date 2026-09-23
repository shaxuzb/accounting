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
import { hrRoutes } from "@/modules/hr";
import EimzoBridgePage from "@/features/eimzo/bridge/EimzoBridgePage";
import { rentalRoutes } from "@/modules/rental";
import { dashboardRoutes } from "@/modules/dashboard";
import RouteErrorPage, { NotFoundPage } from "./RouteErrorPage";
import { reportsRoutes } from "@/modules/reports";

export const router = createBrowserRouter([
  {
    path: "/eimzo-bridge",
    element: <EimzoBridgePage />,
  },
  {
    path: "/",
    element: <ProtectAuthLayout />,
    // Aks holda noto'g'ri manzil React Router'ning xom xato ekranini ko'rsatadi.
    errorElement: <RouteErrorPage />,

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
          cashOperationRoutes,
          saleRoutes,
          faRoutes,
          hrRoutes,
          payrollRoutes,
          accountingsRoutes,
          reportsRoutes,
          accountingRoutes,
          settingsRoutes,
          warehouseRoutes,
          rentalRoutes,
          // Layout ichida qoladi: sidebar va header saqlanadi.
          { path: "*", element: <NotFoundPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
