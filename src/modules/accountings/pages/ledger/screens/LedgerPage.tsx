import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useGetLedger } from "../hooks";
import LedgerFilters from "../components/LedgerFilters";
import type { LedgerQuery } from "../types/type";

export default function LedgerPage() {
  const [filters, setFilters] = useState<LedgerQuery | null>(null);
  const query = useGetLedger(filters ?? undefined);

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="mb-1! text-text!">
          Ledger
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          Swagger endpoint: <code>/api/register/ledger</code>
        </p>
      </div>

      <LedgerFilters loading={query.isFetching} onSubmit={(values) => setFilters(values)} />

      <EndpointResultCard
        title="Response"
        description="Ledger response data."
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Ledger natijasi yo'q"
      />
    </div>
  );
}
