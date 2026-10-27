import { useQuery } from "@tanstack/react-query";
import { Button, Checkbox, DatePicker, Input, Select, Table, Tag, type TableColumnsType } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import ChangeDiff from "@/components/audit/ChangeDiff";
import type { AuditChange } from "@/components/audit/RecordHistoryDrawer";
import { $axiosPrivate } from "@/services/AxiosService";
import {
  actionKindLabel,
  changeActionLabel,
  endpointLabel,
  formatAuditValue,
  tableLabel,
} from "@/shared/audit/auditLabels";
import { routeForTable } from "@/shared/audit/auditTables";

export interface AuditAction {
  id: number;
  createdAt: string;
  requestId: string;
  kind: string;
  userId: number | null;
  userName: string | null;
  method: string | null;
  endpoint: string | null;
  path: string | null;
  entityId: string | null;
  statusCode: number | null;
  durationMs: number | null;
  ipAddress: string | null;
  comment: string | null;
  changes: number;
  rootTable: string | null;
  rootId: string | null;
}

interface Paged<T> {
  items: T[];
  totalCount: number;
}

const kinds = ["REQUEST", "LOGIN", "LOGOUT", "SESSION_END", "SESSION_RESUME"];

/** The changes one action made, loaded when its row is opened. */
function ActionChanges({ requestId }: { requestId: string }) {
  const { t } = useTranslation();
  const { data = [], isLoading } = useQuery({
    queryKey: ["audit-request-changes", requestId],
    queryFn: () =>
      $axiosPrivate.get<AuditChange[]>(`/audit/actions/${requestId}/changes`).then((r) => r.data),
  });

  if (isLoading) return <div className="p-2 text-xs text-secondary-text">…</div>;
  if (!data.length) return <div className="p-2 text-xs text-secondary-text">{t("audit.journal.noChanges")}</div>;

  return (
    <div className="space-y-2 p-2">
      {data.map((change) => {
        const changes = JSON.parse(change.changes) as Record<string, unknown[]>;
        return (
          <div key={change.id} className="rounded-md border border-border bg-primary-bg p-2">
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              <Tag className="m-0!">{changeActionLabel(t, change.action, changes)}</Tag>
              <span>{tableLabel(t, change.tableName)}</span>
              <span className="text-secondary-text">#{change.recordId}</span>
            </div>
            <ChangeDiff
              action={change.action}
              changes={changes}
              labels={change.labels}
              parentId={change.tableName !== change.rootTable ? change.rootId : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The journal of what users did: each request that changed data (and exports, prints, sign-ins),
 * opened to the fields it changed. With a user given, only that user's.
 */
export default function AuditJournal({ userId }: { userId?: number }) {
  const { t } = useTranslation();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf("day"), dayjs().startOf("day")]);
  const [kind, setKind] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [onlyChanges, setOnlyChanges] = useState(false);
  const [onlyFailed, setOnlyFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const params = {
    dateFrom: range[0].format("YYYY-MM-DD"),
    dateTo: range[1].format("YYYY-MM-DD"),
    userId,
    kind,
    search: search || undefined,
    onlyChanges,
    onlyFailed,
    page,
    pageSize,
  };
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["audit-actions", params],
    queryFn: () => $axiosPrivate.get<Paged<AuditAction>>("/audit/actions", { params }).then((r) => r.data),
  });

  const columns: TableColumnsType<AuditAction> = [
    {
      title: t("audit.journal.time"),
      dataIndex: "createdAt",
      width: 150,
      render: (value: string) => formatAuditValue(value),
    },
    ...(userId
      ? []
      : [{ title: t("audit.journal.user"), dataIndex: "userName", width: 180 } as TableColumnsType<AuditAction>[number]]),
    {
      title: t("audit.journal.action"),
      render: (_, row) => (
        <div>
          <div>{row.kind === "REQUEST" ? endpointLabel(t, row.endpoint, row.method) : actionKindLabel(t, row.kind)}</div>
          {row.comment && <div className="text-xs text-secondary-text">{row.comment}</div>}
        </div>
      ),
    },
    {
      title: t("audit.journal.record"),
      width: 160,
      render: (_, row) => {
        const route = routeForTable(row.rootTable, row.rootId ?? row.entityId);
        const label = row.rootTable ? `${tableLabel(t, row.rootTable)} #${row.rootId}` : row.entityId;
        return route ? <Link to={route}>{label}</Link> : label;
      },
    },
    {
      title: t("audit.journal.result"),
      dataIndex: "statusCode",
      width: 90,
      align: "center",
      render: (code: number | null) =>
        code === null ? null : <Tag color={code >= 400 ? "red" : "green"}>{code}</Tag>,
    },
    {
      title: t("audit.journal.changes"),
      dataIndex: "changes",
      width: 90,
      align: "center",
    },
    {
      title: "IP",
      dataIndex: "ipAddress",
      width: 120,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <DatePicker.RangePicker
          value={range}
          format="DD.MM.YYYY"
          allowClear={false}
          onChange={(value) => {
            if (value?.[0] && value[1]) {
              setRange([value[0], value[1]]);
              setPage(1);
            }
          }}
        />
        <Select
          allowClear
          className="w-48"
          placeholder={t("audit.journal.kind")}
          value={kind}
          onChange={(value) => {
            setKind(value);
            setPage(1);
          }}
          options={kinds.map((value) => ({ value, label: actionKindLabel(t, value) }))}
        />
        <Input.Search
          allowClear
          className="w-56!"
          placeholder={t("audit.journal.search")}
          onSearch={(value) => {
            setSearch(value.trim());
            setPage(1);
          }}
        />
        <Checkbox checked={onlyChanges} onChange={(e) => setOnlyChanges(e.target.checked)}>
          {t("audit.journal.onlyChanges")}
        </Checkbox>
        <Checkbox checked={onlyFailed} onChange={(e) => setOnlyFailed(e.target.checked)}>
          {t("audit.journal.onlyFailed")}
        </Checkbox>
        <Button icon={<RefreshCw className="size-4" />} onClick={() => void refetch()} />
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={isFetching}
        columns={columns}
        dataSource={data?.items ?? []}
        expandable={{
          expandedRowRender: (row) => <ActionChanges requestId={row.requestId} />,
          rowExpandable: (row) => row.changes > 0,
        }}
        pagination={{
          current: page,
          pageSize,
          total: data?.totalCount ?? 0,
          showSizeChanger: true,
          onChange: (next, size) => {
            setPage(next);
            setPageSize(size);
          },
        }}
        scroll={{ x: 900 }}
      />
    </div>
  );
}
