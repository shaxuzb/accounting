import { useState } from "react";
import { Typography } from "antd";
import EndpointResultCard from "@/modules/accountings/components/EndpointResultCard";
import { useGetAuditLogs } from "../hooks";
import AuditLogFilters from "../components/AuditLogFilters";
import type { AuditLogQuery } from "../types/type";

export default function AuditLogPage() {
  const [filters, setFilters] = useState<AuditLogQuery | null>(null);
  const query = useGetAuditLogs(filters ?? undefined);

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1 !text-text">
          Audit log
        </Typography.Title>
        <p className="text-sm text-secondary-text">
          Swagger endpoint: <code>/api/audit-logs</code>
        </p>
      </div>

      <AuditLogFilters
        loading={query.isFetching}
        onSubmit={(values) => setFilters(values)}
      />

      <EndpointResultCard
        title="Response"
        description="RecordId va TableName bo'yicha audit yozuvlari."
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Audit log topilmadi"
      />
    </div>
  );
}
