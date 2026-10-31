import { Alert, Button, DatePicker, Input, Modal, Popconfirm, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { Download, KeyRound, Plus, Power, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import { formatDate } from "@/utils/utils";
import {
  ACTIVE_RUN_STATUSES,
  downloadOneCFile,
  errorText,
  useCancelOneCRun,
  useCreateOneCConnection,
  useCreateOneCRun,
  useNewOneCPairingCode,
  useOneCConnections,
  useOneCRuns,
  useOneCStats,
  useRevokeOneCConnection,
  type OneCConnection,
  type OneCPairingCode,
  type OneCRun,
  type OneCRunKind,
} from "./api";

const T = "settings.integrations.onec";

const runStatusColor: Record<string, string> = {
  QUEUED: "default",
  EXTRACTING: "processing",
  RECEIVED: "cyan",
  IMPORTING: "processing",
  DONE: "success",
  FAILED: "error",
  CANCELLED: "default",
};

/** The one-time code, big enough to type into 1C, with the time it has left. */
function PairingCodeModal({ code, onClose }: { code: OneCPairingCode | null; onClose: () => void }) {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!code) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [code]);
  if (!code) return null;

  const left = Math.max(0, Math.round((dayjs(code.expiresAt).valueOf() - now) / 1000));
  return (
    <Modal open title={t(`${T}.code.title`)} onCancel={onClose} footer={<Button onClick={onClose}>{t(`${T}.close`)}</Button>}>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-gray-50 py-4 text-center font-mono text-4xl font-bold tracking-widest dark:bg-transparent">
          {code.code}
        </div>
        <div className="text-center text-sm text-secondary-text">
          {left > 0
            ? t(`${T}.code.expiresIn`, { time: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` })
            : t(`${T}.code.expired`)}
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>{t(`${T}.steps.download`)}</li>
          <li>{t(`${T}.steps.open`)}</li>
          <li>{t(`${T}.steps.enter`)}</li>
        </ol>
      </div>
    </Modal>
  );
}

/** What can be asked of the 1C side, and the runs it did. */
function ConnectionRuns({ connection }: { connection: OneCConnection }) {
  const { t } = useTranslation();
  const runs = useOneCRuns(connection.id);
  const lastRun = runs.data?.[0];
  const stats = useOneCStats(connection.id, lastRun ? `${lastRun.id}:${lastRun.status}` : undefined);
  const createRun = useCreateOneCRun();
  const cancelRun = useCancelOneCRun();
  const [openingDate, setOpeningDate] = useState<Dayjs>(dayjs().startOf("year"));
  const [period, setPeriod] = useState<[Dayjs, Dayjs]>([dayjs().startOf("year"), dayjs()]);
  const busy = runs.data?.some((run) => ACTIVE_RUN_STATUSES.includes(run.status)) ?? false;
  const canRun = connection.status === "ACTIVE" && !busy;

  const start = (kind: OneCRunKind, dateFrom?: Dayjs, dateTo?: Dayjs) =>
    createRun.mutate(
      {
        connectionId: connection.id,
        kind,
        dateFrom: dateFrom?.format("YYYY-MM-DD"),
        dateTo: dateTo?.format("YYYY-MM-DD"),
      },
      {
        onSuccess: () => toast.success(t(`${T}.runs.queued`)),
        onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
      },
    );

  const columns: TableColumnsType<OneCRun> = [
    { title: "№", dataIndex: "id", width: 60 },
    { title: t(`${T}.runs.kind`), dataIndex: "kind", render: (kind: string) => t(`${T}.kinds.${kind}`) },
    {
      title: t(`${T}.runs.period`),
      render: (_, run) =>
        run.dateFrom
          ? run.dateFrom === run.dateTo
            ? formatDate(run.dateFrom, "DD.MM.YYYY")
            : `${formatDate(run.dateFrom, "DD.MM.YYYY")} – ${formatDate(run.dateTo ?? undefined, "DD.MM.YYYY")}`
          : "—",
    },
    {
      title: t(`${T}.runs.status`),
      dataIndex: "status",
      render: (status: string, run) => (
        <Tooltip title={run.errorMessage}>
          <Tag color={runStatusColor[status]}>{t(`${T}.statuses.${status}`)}</Tag>
        </Tooltip>
      ),
    },
    { title: t(`${T}.runs.objects`), dataIndex: "objectCount", align: "right", width: 100 },
    { title: t(`${T}.runs.requestedBy`), dataIndex: "requestedByName", render: (name: string | null) => name ?? t(`${T}.runs.schedule`) },
    { title: t(`${T}.runs.created`), dataIndex: "createdDate", width: 150, render: (value: string) => formatDate(value) },
    {
      width: 110,
      render: (_, run) =>
        ["QUEUED", "EXTRACTING", "RECEIVED"].includes(run.status) && (
          <Popconfirm title={t(`${T}.runs.cancelConfirm`)} onConfirm={() => cancelRun.mutate(run.id)}>
            <Button size="small" danger>
              {t(`${T}.runs.cancel`)}
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {connection.status !== "ACTIVE" && <Alert type="info" showIcon message={t(`${T}.runs.notPaired`)} />}
      {busy && <Alert type="warning" showIcon message={t(`${T}.runs.busy`)} />}
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={!canRun} onClick={() => start("METADATA")}>
          {t(`${T}.kinds.METADATA`)}
        </Button>
        <Button disabled={!canRun} onClick={() => start("CATALOGS")}>
          {t(`${T}.kinds.CATALOGS`)}
        </Button>
        <span className="ml-2 flex items-center gap-1">
          <DatePicker value={openingDate} format="DD.MM.YYYY" allowClear={false} onChange={(value) => value && setOpeningDate(value)} />
          <Button disabled={!canRun} onClick={() => start("OPENING", openingDate)}>
            {t(`${T}.kinds.OPENING`)}
          </Button>
        </span>
        <span className="ml-2 flex items-center gap-1">
          <DatePicker.RangePicker
            value={period}
            format="DD.MM.YYYY"
            allowClear={false}
            onChange={(value) => value?.[0] && value[1] && setPeriod([value[0], value[1]])}
          />
          <Button disabled={!canRun} onClick={() => start("DOCUMENTS", period[0], period[1])}>
            {t(`${T}.kinds.DOCUMENTS`)}
          </Button>
        </span>
      </div>
      <Table rowKey="id" size="small" loading={runs.isLoading} columns={columns} dataSource={runs.data ?? []} pagination={false} />
      {!!stats.data?.length && (
        <div>
          <div className="mb-1 text-sm font-medium">{t(`${T}.stats.title`)}</div>
          <Table
            rowKey={(row) => `${row.typeName}:${row.status}`}
            size="small"
            pagination={false}
            dataSource={stats.data}
            columns={[
              { title: t(`${T}.stats.type`), dataIndex: "typeName" },
              { title: t(`${T}.stats.status`), dataIndex: "status", width: 140, render: (status: string) => t(`${T}.objectStatuses.${status}`) },
              { title: t(`${T}.stats.count`), dataIndex: "count", width: 100, align: "right" },
            ]}
          />
        </div>
      )}
    </div>
  );
}

/**
 * The 1C connector. The client downloads the agent (.exe) or the processing (.epf) here, pairs
 * it with a one-time code, and asks it from here what to read from 1C; the 1C side pushes it in.
 */
export default function OneCPage() {
  const { t } = useTranslation();
  const connections = useOneCConnections();
  const createConnection = useCreateOneCConnection();
  const newCode = useNewOneCPairingCode();
  const revoke = useRevokeOneCConnection();
  const [code, setCode] = useState<OneCPairingCode | null>(null);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState<number[]>([]);

  // the newest live connection is opened by itself
  const firstActive = connections.data?.find((connection) => connection.status !== "REVOKED")?.id;
  useEffect(() => {
    if (firstActive && expanded.length === 0) setExpanded([firstActive]);
  }, [firstActive, expanded.length]);

  const download = (kind: "agent" | "epf") =>
    downloadOneCFile(kind).catch(() => toast.error(t(`${T}.downloadNotReady`)));

  const create = () =>
    createConnection.mutate(name.trim(), {
      onSuccess: (result) => {
        setNaming(false);
        setName("");
        setCode(result);
        setExpanded([result.connectionId]);
      },
      onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
    });

  const statusTag = (connection: OneCConnection) =>
    connection.status === "REVOKED" ? (
      <Tag>{t(`${T}.connection.revoked`)}</Tag>
    ) : connection.status === "PENDING" ? (
      <Tag color="gold">{t(`${T}.connection.pending`)}</Tag>
    ) : connection.isOnline ? (
      <Tag color="green">{t(`${T}.connection.online`)}</Tag>
    ) : (
      <Tag color="default">{t(`${T}.connection.offline`)}</Tag>
    );

  const columns: TableColumnsType<OneCConnection> = [
    { title: t(`${T}.connection.name`), dataIndex: "name" },
    { title: t(`${T}.connection.status`), width: 120, render: (_, connection) => statusTag(connection) },
    {
      title: t(`${T}.connection.client`),
      render: (_, connection) =>
        connection.clientKind ? (
          <div>
            <div>{t(`${T}.clientKinds.${connection.clientKind}`)}</div>
            <div className="text-xs text-secondary-text">{connection.machineName}</div>
          </div>
        ) : (
          "—"
        ),
    },
    {
      title: t(`${T}.connection.base`),
      render: (_, connection) =>
        connection.configName ? (
          <div>
            <div>{connection.configSynonym ?? connection.configName}</div>
            <div className="text-xs text-secondary-text">
              {connection.configVersion} {connection.basePath && `· ${connection.basePath}`}
            </div>
          </div>
        ) : (
          "—"
        ),
    },
    { title: t(`${T}.connection.lastSeen`), dataIndex: "lastSeenAt", width: 150, render: (value: string | null) => formatDate(value ?? undefined) },
    {
      width: 220,
      render: (_, connection) =>
        connection.status !== "REVOKED" && (
          <div className="flex gap-2">
            <Button
              size="small"
              icon={<KeyRound className="size-3.5" />}
              onClick={() =>
                newCode.mutate(connection.id, {
                  onSuccess: setCode,
                  onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
                })
              }
            >
              {t(`${T}.connection.newCode`)}
            </Button>
            <Popconfirm title={t(`${T}.connection.revokeConfirm`)} onConfirm={() => revoke.mutate(connection.id)}>
              <Button size="small" danger icon={<Power className="size-3.5" />}>
                {t(`${T}.connection.revoke`)}
              </Button>
            </Popconfirm>
          </div>
        ),
    },
  ];

  return (
    <Card className="space-y-4 p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="space-y-1 text-sm">
          <div className="text-base font-semibold">{t(`${T}.title`)}</div>
          <p className="text-secondary-text">{t(`${T}.intro`)}</p>
          <ul className="list-disc pl-5 text-secondary-text">
            <li>{t(`${T}.ways.agent`)}</li>
            <li>{t(`${T}.ways.epf`)}</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <Button icon={<Download className="size-4" />} onClick={() => void download("agent")}>
            {t(`${T}.downloadAgent`)}
          </Button>
          <Button icon={<Download className="size-4" />} onClick={() => void download("epf")}>
            {t(`${T}.downloadEpf`)}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setNaming(true)}>
          {t(`${T}.connection.create`)}
        </Button>
        <Button icon={<RefreshCw className="size-4" />} onClick={() => void connections.refetch()} />
      </div>

      <Table
        rowKey="id"
        size="small"
        loading={connections.isLoading}
        columns={columns}
        dataSource={connections.data ?? []}
        pagination={false}
        locale={{ emptyText: t(`${T}.connection.empty`) }}
        expandable={{
          expandedRowKeys: expanded,
          onExpandedRowsChange: (keys) => setExpanded(keys as number[]),
          rowExpandable: (connection) => connection.status !== "REVOKED",
          expandedRowRender: (connection) => <ConnectionRuns connection={connection} />,
        }}
      />

      <Modal
        open={naming}
        title={t(`${T}.connection.create`)}
        okText={t(`${T}.connection.createOk`)}
        confirmLoading={createConnection.isPending}
        onOk={create}
        onCancel={() => setNaming(false)}
      >
        <Input
          autoFocus
          value={name}
          maxLength={200}
          placeholder={t(`${T}.connection.namePlaceholder`)}
          onChange={(event) => setName(event.target.value)}
          onPressEnter={create}
        />
      </Modal>
      <PairingCodeModal code={code} onClose={() => setCode(null)} />
    </Card>
  );
}
