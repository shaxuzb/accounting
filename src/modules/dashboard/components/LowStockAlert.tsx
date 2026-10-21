import { Alert, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";

const STOCK_PERMISSION = "PRODUCT_STOCK_GET_PRODUCT_SUMMARY";

/**
 * The goods whose stock fell below the minimum of their card: a warning on the dashboard that
 * opens them in the stock list. Shown only to whoever sees the stock, and only when there are any.
 */
export default function LowStockAlert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const allowed = permissions.includes(STOCK_PERMISSION);
  const { data } = useQuery({
    queryKey: ["dashboard", "low-stock"],
    queryFn: async () =>
      (await $axiosPrivate.get<{ totalCount?: number; items?: unknown[] }>("product-stocks/products", {
        params: { belowMinimum: true, page: 1, pageSize: 1 },
      })).data,
    enabled: allowed,
    staleTime: 60_000,
  });
  const count = data?.totalCount ?? (data as { total?: number } | undefined)?.total ?? 0;
  if (!allowed || count === 0) return null;
  return (
    <Alert
      type="warning"
      showIcon
      message={t("dashboard.lowStock", { count })}
      action={
        <Button size="small" onClick={() => navigate("/main/warehouses/warehouse?belowMin=1")}>
          {t("dashboard.lowStockOpen")}
        </Button>
      }
    />
  );
}
