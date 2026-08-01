import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useGetAuditLogs } from "../hooks";
import AuditLogFilters from "../components/AuditLogFilters";
import type { AuditLogQuery } from "../types/type";
import { useTranslation } from "react-i18next";

export default function AuditLogPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AuditLogQuery | null>(null);
  const query = useGetAuditLogs(filters ?? undefined);

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1 !text-text">
          {t("accountings.audit.title")}
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          {t("accountings.endpoint")}: <code>/api/audit-logs</code>
        </p>
      </div>

      <AuditLogFilters
        loading={query.isFetching}
        onSubmit={(values) => setFilters(values)}
      />

      <EndpointResultCard
        title={t("accountings.result.title")}
        description={t("accountings.audit.resultDescription")}
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText={t("accountings.audit.empty")}
      />
    </div>
  );
}
