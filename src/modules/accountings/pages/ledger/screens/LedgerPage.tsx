import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useGetLedger } from "../hooks";
import LedgerFilters from "../components/LedgerFilters";
import type { LedgerQuery } from "../types/type";
import { useTranslation } from "react-i18next";

export default function LedgerPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<LedgerQuery | null>(null);
  const query = useGetLedger(filters ?? undefined);

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="mb-1! text-text!">
          {t("accountings.ledger.title")}
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          {t("accountings.endpoint")}: <code>/api/register/ledger</code>
        </p>
      </div>

      <LedgerFilters loading={query.isFetching} onSubmit={(values) => setFilters(values)} />

      <EndpointResultCard
        title={t("accountings.result.title")}
        description={t("accountings.ledger.resultDescription")}
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText={t("accountings.ledger.empty")}
      />
    </div>
  );
}
