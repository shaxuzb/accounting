import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import AccountingPeriodActions from "../components/AccountingPeriodActions";
import {
  useCloseAccountingPeriod,
  useReopenAccountingPeriod,
} from "../hooks";
import type { AccountingPeriodActionQuery } from "../types/type";
import { useTranslation } from "react-i18next";

export default function AccountingPeriodsPage() {
  const { t } = useTranslation();
  const closeMutation = useCloseAccountingPeriod();
  const reopenMutation = useReopenAccountingPeriod();
  const [lastResult, setLastResult] = useState<unknown>(null);

  const handleClose = async (values: AccountingPeriodActionQuery) => {
    const result = await closeMutation.mutateAsync(values);
    setLastResult(result);
  };

  const handleReopen = async (values: AccountingPeriodActionQuery) => {
    const result = await reopenMutation.mutateAsync(values);
    setLastResult(result);
  };

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="mb-1! text-text!">
          {t("accountings.periods.title")}
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          {t("accountings.endpoint")}: <code>/api/accounting-periods/{`{id}`}/close</code> {t("common.and")}{" "}
          <code>/api/accounting-periods/{`{id}`}/reopen</code>
        </p>
      </div>

      <AccountingPeriodActions
        loading={closeMutation.isPending || reopenMutation.isPending}
        onClose={handleClose}
        onReopen={handleReopen}
      />

      <EndpointResultCard
        title={t("accountings.result.title")}
        description={t("accountings.periods.resultDescription")}
        data={closeMutation.data ?? reopenMutation.data ?? lastResult}
        isLoading={closeMutation.isPending || reopenMutation.isPending}
        emptyText={t("accountings.periods.empty")}
      />
    </div>
  );
}
