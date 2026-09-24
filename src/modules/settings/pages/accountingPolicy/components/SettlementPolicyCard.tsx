import { Switch } from "antd";
import { Handshake } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { accountingPolicyPermissions } from "../constants/permissions";
import {
  useGetSettlementPolicy,
  useUpdateSettlementPolicy,
} from "../hooks/useSettlementPolicy";

/**
 * How settlements with counterparties are kept: per counterparty, or per contract as 1C
 * keeps them ("Договор" analytics of 60/62). It decides which debt a payment settles and
 * which advances a sale or a purchase offsets.
 */
export default function SettlementPolicyCard() {
  const { t } = useTranslation();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canUpdate = permissions.includes(accountingPolicyPermissions.update);
  const policy = useGetSettlementPolicy();
  const update = useUpdateSettlementPolicy();
  const byContract = policy.data?.settlementsByContract ?? false;

  const change = async (checked: boolean) => {
    try {
      await update.mutateAsync({ settlementsByContract: checked });
      toast.success(t("settings.settlementPolicy.saved"));
    } catch (error) {
      errorHandlers(error);
    }
  };

  return (
    <Card className="border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex max-w-3xl gap-3">
          <Handshake className="mt-0.5 size-6 shrink-0 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-heading">
              {t("settings.settlementPolicy.title")}
            </h3>
            <p className="mt-1 text-sm text-secondary-text">
              {t(
                byContract
                  ? "settings.settlementPolicy.byContractHint"
                  : "settings.settlementPolicy.byCounterpartyHint",
              )}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium text-text">
          {t("settings.settlementPolicy.byContract")}
          <Switch
            checked={byContract}
            loading={policy.isLoading || update.isPending}
            disabled={!canUpdate}
            onChange={(checked) => void change(checked)}
          />
        </label>
      </div>
    </Card>
  );
}
