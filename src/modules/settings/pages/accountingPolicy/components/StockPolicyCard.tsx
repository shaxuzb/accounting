import { Switch } from "antd";
import { PackageMinus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { accountingPolicyPermissions } from "../constants/permissions";
import { useGetStockPolicy, useUpdateStockPolicy } from "../hooks/useStockPolicy";

/**
 * 1C «Разрешить списание запасов при отсутствии остатков»: whether a document may write off
 * more than the records hold. The shortfall stands at the last known cost until a receipt
 * covers it; «Ketma-ketlikni tiklash» then gives the issue the receipt's cost.
 */
export default function StockPolicyCard() {
  const { t } = useTranslation();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const canUpdate = permissions.includes(accountingPolicyPermissions.update);
  const policy = useGetStockPolicy();
  const update = useUpdateStockPolicy();
  const allow = policy.data?.allowNegativeStock ?? false;

  const change = async (allowNegativeStock: boolean) => {
    try {
      await update.mutateAsync({ allowNegativeStock });
      toast.success(t("settings.stockPolicy.saved"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Card className="border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-3xl gap-3">
          <PackageMinus className="mt-0.5 size-6 shrink-0 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-heading">{t("settings.stockPolicy.title")}</h3>
            <p className="mt-1 text-sm text-secondary-text">
              {t(allow ? "settings.stockPolicy.allowedHint" : "settings.stockPolicy.forbiddenHint")}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-text">
          {t("settings.stockPolicy.allow")}
          <Switch
            checked={allow}
            loading={policy.isLoading || update.isPending}
            disabled={!canUpdate}
            onChange={(checked) => void change(checked)}
          />
        </label>
      </div>
    </Card>
  );
}
