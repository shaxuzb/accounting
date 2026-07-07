import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import AccountingPeriodActions from "../components/AccountingPeriodActions";
import {
  useCloseAccountingPeriod,
  useReopenAccountingPeriod,
} from "../hooks";
import type { AccountingPeriodActionQuery } from "../types/type";

export default function AccountingPeriodsPage() {
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
          Accounting periods
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          Swagger endpoint: <code>/api/accounting-periods/{`{id}`}/close</code> va{" "}
          <code>/api/accounting-periods/{`{id}`}/reopen</code>
        </p>
      </div>

      <AccountingPeriodActions
        loading={closeMutation.isPending || reopenMutation.isPending}
        onClose={handleClose}
        onReopen={handleReopen}
      />

      <EndpointResultCard
        title="Response"
        description="Period close yoki reopen natijasi."
        data={closeMutation.data ?? reopenMutation.data ?? lastResult}
        isLoading={closeMutation.isPending || reopenMutation.isPending}
        emptyText="Accounting period natijasi yo'q"
      />
    </div>
  );
}
