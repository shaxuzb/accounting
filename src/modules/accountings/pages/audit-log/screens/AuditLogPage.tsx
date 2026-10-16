import { useState } from "react";
import { Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { useGetAuditLogs } from "../hooks";
import AuditLogFilters from "../components/AuditLogFilters";
import type { AuditLogChange, AuditLogItem, AuditLogQuery } from "../types/type";
import { auditTableLabel, auditValue } from "../utils/auditLabels";

const actionColors: Record<string, string> = { INSERT: "green", UPDATE: "blue", DELETE: "red" };

/** 1C «Журнал регистрации»: who changed what and when, with each field's old and new value. */
export default function AuditLogPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AuditLogQuery>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const query = useGetAuditLogs({ ...filters, page, pageSize });
  const data = query.data;

  const columns: TableColumnsType<AuditLogItem> = [
    {
      title: t("accountings.audit.date"),
      dataIndex: "changedDate",
      width: 160,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm:ss"),
    },
    {
      title: t("accountings.audit.user"),
      dataIndex: "changedUserName",
      width: 200,
      render: (value?: string | null) => value || "—",
    },
    {
      title: t("accountings.audit.object"),
      dataIndex: "tableName",
      render: (value: string) => auditTableLabel(t, value),
    },
    { title: t("accountings.audit.recordId"), dataIndex: "recordId", width: 110 },
    {
      title: t("accountings.audit.action"),
      dataIndex: "action",
      width: 140,
      render: (value: string) => (
        <Tag color={actionColors[value] ?? "default"}>{t(`accountings.audit.actions.${value}`, value)}</Tag>
      ),
    },
    {
      title: t("accountings.audit.changes"),
      width: 120,
      align: "right",
      render: (_, record) => record.changeResults.length,
    },
  ];

  const changeColumns: TableColumnsType<AuditLogChange> = [
    { title: t("accountings.audit.field"), dataIndex: "path", width: 260 },
    {
      title: t("accountings.audit.oldValue"),
      dataIndex: "oldValue",
      render: (value: unknown) => <span className="text-red-600 dark:text-red-400">{auditValue(value)}</span>,
    },
    {
      title: t("accountings.audit.newValue"),
      dataIndex: "newValue",
      render: (value: unknown) => <span className="text-green-700 dark:text-green-400">{auditValue(value)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Typography.Title level={3} className="!mb-1 !text-text">
          {t("accountings.audit.title")}
        </Typography.Title>
        <p className="text-sm text-secondary-text">{t("accountings.audit.resultDescription")}</p>
      </div>

      <AuditLogFilters
        loading={query.isFetching}
        onSubmit={(values) => {
          setFilters(values);
          setPage(1);
        }}
      />

      <Card className="border border-border p-0">
        <Table<AuditLogItem>
          rowKey="id"
          size="small"
          loading={query.isLoading || query.isFetching}
          columns={columns}
          dataSource={data?.items ?? []}
          locale={{ emptyText: t("accountings.audit.empty") }}
          expandable={{
            rowExpandable: (record) => record.changeResults.length > 0,
            expandedRowRender: (record) => (
              <Table<AuditLogChange>
                rowKey={(row) => `${record.id}-${row.path}`}
                size="small"
                pagination={false}
                columns={changeColumns}
                dataSource={record.changeResults}
              />
            ),
          }}
          pagination={{
            current: page,
            pageSize,
            total: data?.totalCount ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [20, 50, 100, 200],
            onChange: (nextPage, nextSize) => {
              setPage(nextSize !== pageSize ? 1 : nextPage);
              setPageSize(nextSize);
            },
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
