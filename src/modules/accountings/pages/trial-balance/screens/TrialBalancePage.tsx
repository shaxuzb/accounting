import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import TrialBalanceFilters from "../components/TrialBalanceFilters";
import { useGetTrialBalance } from "../hooks";
import type { TrialBalanceQuery } from "../types/type";

export default function TrialBalancePage() {
  const [filters, setFilters] = useState<TrialBalanceQuery | null>(null);
  const query = useGetTrialBalance(filters ?? undefined);

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1 !text-text">
          Trial balance
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          Swagger endpoint: <code>/api/register/trial-balance</code>
        </p>
      </div>

      <TrialBalanceFilters
        loading={query.isFetching}
        onSubmit={(values) => setFilters(values)}
      />

      <EndpointResultCard
        title="Response"
        description="Aylanma-saldo qaydnomasi."
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Trial balance natijasi yo'q"
      />
    </div>
  );
}
