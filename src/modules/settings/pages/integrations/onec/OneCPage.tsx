import { Alert, Button, DatePicker, Modal, Popconfirm, Progress, Table, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { Download, Eraser, KeyRound, Plus, Power, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import Card from "@/components/ui/card/Card";
import { formatDate } from "@/utils/utils";
import {
  ACTIVE_RUN_STATUSES,
  OPEN_RUN_STATUSES,
  downloadOneCFile,
  errorText,
  useCancelOneCRun,
  useCreateOneCConnection,
  useLoadOneC,
  useNewOneCPairingCode,
  useOneCConnections,
  useOneCRunIssues,
  useOneCRuns,
  useOneCStats,
  useRevokeOneCConnection,
  useCleanupOneCConnection,
  type OneCConnection,
  type OneCPairingCode,
  type OneCProgressPart,
  type OneCRun,
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

const livenessColor: Record<string, string> = {
  WORKING: "green",
  WAITING: "blue",
  CLIENT_OFFLINE: "orange",
  STALLED: "red",
};

/** «12 s ago», «4 min ago»: how long since the run last reported. */
function Ago({ seconds }: { seconds: number | null }) {
  const { t } = useTranslation();
  if (seconds === null) return null;
  return (
    <span className="text-xs text-secondary-text">
      {seconds < 60 ? t(`${T}.progress.secondsAgo`, { n: seconds }) : t(`${T}.progress.minutesAgo`, { n: Math.floor(seconds / 60) })}
    </span>
  );
}

/** The run's bar: the stage it is in, how far, and whether anyone is on it. */
export function RunProgress({ run }: { run: OneCRun }) {
  const { t } = useTranslation();
  const stage =
    run.status === "QUEUED" || run.status === "EXTRACTING"
      ? t(`${T}.progress.stageExtract`)
      : run.status === "RECEIVED" || run.status === "ANALYZING"
        ? t(`${T}.progress.stageAnalyze`)
        : run.status === "PREVIEW"
          ? t(`${T}.progress.stagePreview`)
          : run.status === "IMPORT_QUEUED" || run.status === "IMPORTING"
            ? t(`${T}.progress.stageImport`)
            : null;
  const failed = run.status === "FAILED" || run.liveness === "STALLED";
  return (
    <div className="min-w-56">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span>{stage}</span>
        {run.liveness && (
          <Tooltip title={t(`${T}.liveness.${run.liveness}Hint`)}>
            <Tag className="m-0!" color={livenessColor[run.liveness]}>
              {t(`${T}.liveness.${run.liveness}`)}
            </Tag>
          </Tooltip>
        )}
      </div>
      <Progress
        size="small"
        percent={run.percent}
        status={failed ? "exception" : run.status === "DONE" ? "success" : run.liveness === "WORKING" ? "active" : "normal"}
      />
      {run.liveness && <Ago seconds={run.secondsSinceHeartbeat} />}
    </div>
  );
}

/** Each part of a run (a 1C type or register): reading it, then importing it. */
function RunDetails({ run }: { run: OneCRun }) {
  const { t } = useTranslation();
  const finished = !ACTIVE_RUN_STATUSES.includes(run.status);
  const issues = useOneCRunIssues(run.id, run.skippedCount + run.failedCount > 0 && finished);
  const percent = (part: OneCProgressPart) => (part.total > 0 ? Math.floor((Math.min(part.done, part.total) * 100) / part.total) : 0);

  const partColumns = (withResult: boolean): TableColumnsType<OneCProgressPart> => [
    { title: t(`${T}.stats.type`), dataIndex: "key" },
    {
      title: t(`${T}.progress.done`),
      width: 260,
      render: (_, part) => (
        <div className="flex items-center gap-2">
          <Progress className="m-0! flex-1" size="small" percent={percent(part)} />
          <span className="whitespace-nowrap text-xs">
            {part.done} / {part.total}
          </span>
        </div>
      ),
    },
    ...(withResult
      ? [
          { title: t(`${T}.objectStatuses.IMPORTED`), dataIndex: "imported", width: 110, align: "right" as const },
          { title: t(`${T}.objectStatuses.SKIPPED`), dataIndex: "skipped", width: 120, align: "right" as const },
          {
            title: t(`${T}.objectStatuses.ERROR`),
            dataIndex: "failed",
            width: 80,
            align: "right" as const,
            render: (value: number) => (value > 0 ? <span className="font-medium text-red-600">{value}</span> : value),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3 py-1">
      {run.errorMessage && <Alert type="error" showIcon message={run.errorMessage} />}
      {run.liveness === "STALLED" && <Alert type="warning" showIcon message={t(`${T}.liveness.STALLEDHint`)} />}
      {run.extractProgress.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-medium">{t(`${T}.progress.stageExtract`)}</div>
          <Table rowKey="key" size="small" pagination={false} columns={partColumns(false)} dataSource={run.extractProgress} />
        </div>
      )}
      {run.importProgress.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-medium">{t(`${T}.progress.stageImport`)}</div>
          <Table rowKey="key" size="small" pagination={false} columns={partColumns(true)} dataSource={run.importProgress} />
        </div>
      )}
      {!!issues.data?.length && (
        <div>
          <div className="mb-1 text-sm font-medium">{t(`${T}.progress.issues`)}</div>
          <Table
            rowKey="id"
            size="small"
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            dataSource={issues.data}
            columns={[
              { title: t(`${T}.stats.type`), dataIndex: "typeName", width: 260 },
              { title: t(`${T}.progress.object`), render: (_, issue) => issue.presentation ?? issue.ref },
              {
                title: t(`${T}.stats.status`),
                dataIndex: "status",
                width: 130,
                render: (status: string) => (
                  <Tag color={status === "ERROR" ? "red" : "default"}>{t(`${T}.objectStatuses.${status}`)}</Tag>
                ),
              },
              { title: t(`${T}.progress.reason`), dataIndex: "error" },
            ]}
          />
        </div>
      )}
    </div>
  );
}

/** What can be asked of the 1C side, and the runs it did. */
function ConnectionRuns({ connection }: { connection: OneCConnection }) {
  const { t } = useTranslation();
  const runs = useOneCRuns(connection.id);
  const lastRun = runs.data?.[0];
  const stats = useOneCStats(connection.id, lastRun ? `${lastRun.id}:${lastRun.status}` : undefined);
  const navigate = useNavigate();
  const load = useLoadOneC();
  const cancelRun = useCancelOneCRun();
  const [period, setPeriod] = useState<[Dayjs, Dayjs]>([dayjs().startOf("year"), dayjs()]);
  const open = runs.data?.find((run) => OPEN_RUN_STATUSES.includes(run.status));
  const canRun = connection.status === "ACTIVE" && !open;

  // «Yuklash»: the base for the period is read and analysed, the preview opens by itself
  const start = () =>
    load.mutate(
      { connectionId: connection.id, dateFrom: period[0].format("YYYY-MM-DD"), dateTo: period[1].format("YYYY-MM-DD") },
      {
        onSuccess: (result) => navigate(`runs/${result.id}`),
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
      width: 140,
      render: (status: string, run) => (
        <Tooltip title={run.errorMessage}>
          <Tag color={runStatusColor[status]}>{t(`${T}.statuses.${status}`)}</Tag>
        </Tooltip>
      ),
    },
    { title: t(`${T}.progress.title`), width: 280, render: (_, run) => <RunProgress run={run} /> },
    {
      title: t(`${T}.runs.objects`),
      align: "right",
      width: 150,
      render: (_, run) => (
        <div className="text-xs leading-5">
          <div>{run.objectCount}</div>
          {run.importedCount + run.skippedCount + run.failedCount > 0 && (
            <div className="text-secondary-text">
              <span className="text-green-600">{run.importedCount}</span> / {run.skippedCount} /{" "}
              <span className={run.failedCount > 0 ? "text-red-600" : undefined}>{run.failedCount}</span>
            </div>
          )}
        </div>
      ),
    },
    { title: t(`${T}.runs.requestedBy`), dataIndex: "requestedByName", render: (name: string | null) => name ?? t(`${T}.runs.schedule`) },
    { title: t(`${T}.runs.created`), dataIndex: "createdDate", width: 150, render: (value: string) => formatDate(value) },
    {
      width: 220,
      render: (_, run) => (
        <div className="flex gap-2">
          {run.kind === "LOAD" && !["QUEUED", "EXTRACTING"].includes(run.status) && (
            <Button size="small" type={run.status === "PREVIEW" ? "primary" : "default"} onClick={() => navigate(`runs/${run.id}`)}>
              {t(`${T}.runs.open`)}
            </Button>
          )}
          {["QUEUED", "EXTRACTING", "RECEIVED", "ANALYZING", "PREVIEW", "IMPORT_QUEUED"].includes(run.status) && (
            <Popconfirm title={t(`${T}.runs.cancelConfirm`)} onConfirm={() => cancelRun.mutate(run.id)}>
              <Button size="small" danger>
                {t(`${T}.runs.cancel`)}
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {connection.status !== "ACTIVE" && <Alert type="info" showIcon message={t(`${T}.runs.notPaired`)} />}
      {open && (
        <Alert
          type={open.status === "PREVIEW" ? "info" : "warning"}
          showIcon
          message={open.status === "PREVIEW" ? t(`${T}.runs.previewWaiting`) : t(`${T}.runs.busy`)}
          action={
            open.kind === "LOAD" &&
            !["QUEUED", "EXTRACTING"].includes(open.status) && (
              <Button size="small" type="primary" onClick={() => navigate(`runs/${open.id}`)}>
                {t(`${T}.runs.open`)}
              </Button>
            )
          }
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">{t(`${T}.load.period`)}</span>
        <DatePicker.RangePicker
          value={period}
          format="DD.MM.YYYY"
          allowClear={false}
          onChange={(value) => value?.[0] && value[1] && setPeriod([value[0], value[1]])}
        />
        <Button type="primary" disabled={!canRun} loading={load.isPending} onClick={start}>
          {t(`${T}.load.button`)}
        </Button>
        <span className="text-xs text-secondary-text">{t(`${T}.load.hint`)}</span>
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={runs.isLoading}
        columns={columns}
        dataSource={runs.data ?? []}
        pagination={false}
        expandable={{
          expandedRowRender: (run) => <RunDetails run={run} />,
          rowExpandable: (run) => run.extractProgress.length + run.importProgress.length > 0 || !!run.errorMessage,
        }}
      />
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
  const cleanup = useCleanupOneCConnection();
  const [code, setCode] = useState<OneCPairingCode | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);

  // the newest live connection is opened by itself
  const firstActive = connections.data?.find((connection) => connection.status !== "REVOKED")?.id;
  useEffect(() => {
    if (firstActive && expanded.length === 0) setExpanded([firstActive]);
  }, [firstActive, expanded.length]);

  const download = (kind: "agent") =>
    downloadOneCFile(kind).catch(() => toast.error(t(`${T}.downloadNotReady`)));

  // one connection per organization: connecting again gives it a new code
  const live = connections.data?.find((connection) => connection.status !== "REVOKED");
  const create = () =>
    createConnection.mutate(undefined, {
      onSuccess: (result) => {
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
      width: 320,
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
            <Popconfirm
              title={<div className="max-w-80">{t(`${T}.connection.cleanupConfirm`)}</div>}
              onConfirm={() =>
                cleanup.mutate(connection.id, {
                  onSuccess: () => toast.success(t(`${T}.connection.cleaned`)),
                  onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
                })
              }
            >
              <Button size="small" icon={<Eraser className="size-3.5" />} loading={cleanup.isPending}>
                {t(`${T}.connection.cleanup`)}
              </Button>
            </Popconfirm>
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
          <p className="text-secondary-text">{t(`${T}.ways.agent`)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button icon={<Download className="size-4" />} onClick={() => void download("agent")}>
            {t(`${T}.downloadAgent`)}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!live && (
          <Button type="primary" icon={<Plus className="size-4" />} loading={createConnection.isPending} onClick={create}>
            {t(`${T}.connection.create`)}
          </Button>
        )}
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

      <PairingCodeModal code={code} onClose={() => setCode(null)} />
    </Card>
  );
}
