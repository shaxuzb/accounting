import { Alert, Button, Checkbox, Drawer, Empty, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import { ArrowLeft, FolderPlus, Pencil, RotateCcw, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import Card from "@/components/ui/card/Card";
import { formatDate } from "@/utils/utils";
import {
  errorText,
  useOneCObject,
  useOneCPreflight,
  useOneCOurAccounts,
  useOneCPreview,
  useOneCPreviewObjects,
  useOneCRun,
  useOneCRunAccounts,
  useAutoMapOneCAccounts,
  useCreateOneCSubAccount,
  useOneCOurGroups,
  useSaveOneCAccounts,
  useSelectOneC,
  useStartOneCImport,
  useUpdateOneCObject,
  type OneCAccountRow,
  type OneCPreviewObject,
  type OneCPreviewSection,
  type OneCPreviewStatus,
} from "./api";
import { CompareTab, PostingsCompare } from "./OneCComparePanel";
import { PreflightTab } from "./OneCPreflightPanel";
import { RunProgress } from "./OneCPage";

const T = "settings.integrations.onec";
const P = `${T}.preview`;

const previewColor: Record<OneCPreviewStatus, string> = {
  NEW_ENTITY: "green",
  MATCHED: "blue",
  NEEDS_MAPPING: "orange",
  INVALID: "red",
  UNSUPPORTED: "default",
  SKIP: "default",
};

const kindColor: Record<string, string> = { ACCOUNT: "purple", CATALOG: "cyan", BALANCE: "gold", DOCUMENT: "geekblue", OSV: "default" };

/** A value as 1C sent it: a reference by its presentation (an account with its code), the rest as text. */
function show(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "✓" : "✗";
  if (typeof value === "object") {
    const ref = value as { presentation?: string; code?: string; value?: string };
    if (ref.code) return ref.presentation && ref.presentation !== ref.code ? `${ref.code} ${ref.presentation}` : ref.code;
    return ref.presentation ?? ref.value ?? JSON.stringify(value);
  }
  return String(value);
}

/** Only a plain value can be corrected by typing; a reference is chosen in 1C, or mapped. */
const editable = (value: unknown) => value === null || value === undefined || ["string", "number"].includes(typeof value);

function PreviewTag({ status, note }: { status: OneCPreviewStatus | null; note?: string | null }) {
  const { t } = useTranslation();
  if (!status) return <Tag>{t(`${P}.statuses.PENDING`)}</Tag>;
  return (
    <Tooltip title={note}>
      <Tag className="m-0!" color={previewColor[status]}>
        {t(`${P}.statuses.${status}`)}
      </Tag>
    </Tooltip>
  );
}

/** Rows of a 1C table (a document's goods, its entries) with the columns they carry. */
function RowsTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = useMemo(() => {
    // the row's number first, as 1C shows its tables
    const names = [...new Set(rows.flatMap((row) => Object.keys(row)))].sort(
      (a, b) => Number(b === "НомерСтроки") - Number(a === "НомерСтроки"),
    );
    return names.map((name) => ({ title: name, dataIndex: name, render: (value: unknown) => show(value) }));
  }, [rows]);
  return (
    <Table
      rowKey={(_, index) => String(index)}
      size="small"
      pagination={false}
      scroll={{ x: "max-content" }}
      columns={columns}
      dataSource={rows}
    />
  );
}

/** One object opened: everything 1C sent, its corrections, picking it in or out. */
function ObjectDrawer({ objectId, editableRun, onClose }: { objectId: number | null; editableRun: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const detail = useOneCObject(objectId);
  const update = useUpdateOneCObject();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
    const fields = detail.data?.overrides?.fields ?? {};
    setDraft(Object.fromEntries(Object.entries(fields).map(([name, value]) => [name, String(value ?? "")])));
  }, [detail.data]);

  const data = detail.data;
  const fields = Object.entries(data?.payload.fields ?? {});
  const tables = Object.entries(data?.payload.tables ?? {}).filter(([, rows]) => rows.length > 0);
  const entries = data?.payload.entries ?? [];

  const save = (overrides: Record<string, string>) =>
    objectId !== null &&
    update.mutate(
      { id: objectId, overrides: { fields: overrides } },
      {
        onSuccess: () => {
          setEditing(false);
          toast.success(t(`${P}.saved`));
        },
        onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
      },
    );

  return (
    <Drawer
      open={objectId !== null}
      width={860}
      onClose={onClose}
      title={data ? data.row.presentation ?? data.row.ref : "…"}
      extra={
        data && (
          <Space>
            <span className="text-sm">{t(`${P}.importIt`)}</span>
            <Switch
              checked={data.row.selected}
              disabled={!editableRun}
              onChange={(selected) => objectId !== null && update.mutate({ id: objectId, selected })}
            />
          </Space>
        )
      }
    >
      {data && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Tag color={kindColor[data.row.kind]}>{t(`${P}.kinds.${data.row.kind}`)}</Tag>
            <span className="text-secondary-text">{data.row.typeName}</span>
            {data.payload.number && <span>№ {data.payload.number}</span>}
            {data.payload.date && <span>{formatDate(data.payload.date)}</span>}
            {data.payload.posted !== undefined && (
              <Tag>{data.payload.posted ? t(`${P}.posted`) : t(`${P}.notPosted`)}</Tag>
            )}
            {data.row.isDeleted && <Tag color="red">{t(`${P}.deleted`)}</Tag>}
          </div>
          <Alert
            showIcon
            type={data.row.previewStatus === "INVALID" ? "error" : data.row.previewStatus === "NEEDS_MAPPING" ? "warning" : "info"}
            message={<PreviewTag status={data.row.previewStatus} />}
            description={data.row.previewNote ?? undefined}
          />
          {data.row.status !== "NEW" && (
            <Alert showIcon type={data.row.status === "ERROR" ? "error" : "success"} message={`${t(`${T}.objectStatuses.${data.row.status}`)}${data.row.error ? `: ${data.row.error}` : ""}`} />
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{t(`${P}.fields`)}</span>
              {editableRun && (
                <Space>
                  {data.overrides && (
                    <Popconfirm title={t(`${P}.resetConfirm`)} onConfirm={() => save({})}>
                      <Button size="small" icon={<RotateCcw className="size-3.5" />}>
                        {t(`${P}.reset`)}
                      </Button>
                    </Popconfirm>
                  )}
                  {editing ? (
                    <>
                      <Button size="small" onClick={() => setEditing(false)}>
                        {t(`${T}.close`)}
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        loading={update.isPending}
                        onClick={() => save(Object.fromEntries(Object.entries(draft).filter(([, value]) => value !== undefined)))}
                      >
                        {t(`${P}.saveFix`)}
                      </Button>
                    </>
                  ) : (
                    <Button size="small" icon={<Pencil className="size-3.5" />} onClick={() => setEditing(true)}>
                      {t(`${P}.fix`)}
                    </Button>
                  )}
                </Space>
              )}
            </div>
            <Table
              rowKey="0"
              size="small"
              pagination={false}
              dataSource={fields}
              columns={[
                { title: t(`${P}.field`), width: 220, render: (_, [name]) => <span className="font-mono text-xs">{name}</span> },
                {
                  title: t(`${P}.value1C`),
                  render: (_, [name, value]) => (
                    <span className={draft[name] !== undefined && !editing ? "text-secondary-text line-through" : undefined}>
                      {show(value)}
                    </span>
                  ),
                },
                {
                  title: t(`${P}.fixed`),
                  width: 260,
                  render: (_, [name, value]) =>
                    editing && editable(value) ? (
                      <Input
                        size="small"
                        allowClear
                        value={draft[name]}
                        placeholder={show(value)}
                        onChange={(event) => {
                          const next = { ...draft };
                          if (event.target.value === "") delete next[name];
                          else next[name] = event.target.value;
                          setDraft(next);
                        }}
                      />
                    ) : draft[name] !== undefined ? (
                      <span className="font-medium text-green-700">{draft[name]}</span>
                    ) : null,
                },
              ]}
            />
          </div>

          {tables.map(([name, rows]) => (
            <div key={name}>
              <div className="mb-2 font-medium">
                {name} <span className="text-secondary-text">({rows.length})</span>
              </div>
              <RowsTable rows={rows} />
            </div>
          ))}

          {entries.length > 0 && (
            <div>
              <div className="mb-2 font-medium">
                {t(`${P}.entries`)} <span className="text-secondary-text">({entries.length})</span>
              </div>
              <RowsTable rows={entries} />
            </div>
          )}

          {data.row.status === "IMPORTED" && <PostingsCompare objectId={objectId} />}
        </div>
      )}
    </Drawer>
  );
}

/** A section's objects: filter, search, pick in or out, open one. */
function SectionObjects({
  runId,
  section,
  version,
  editableRun,
  onBack,
}: {
  runId: number;
  section: OneCPreviewSection;
  version: string;
  editableRun: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState({ typeName: section.typeName, previewStatus: undefined as string | undefined, search: undefined as string | undefined, page: 1, pageSize: 50 });
  const objects = useOneCPreviewObjects(runId, filter, version, true);
  const update = useUpdateOneCObject();
  const select = useSelectOneC();
  const [opened, setOpened] = useState<number | null>(null);
  const documents = section.kind === "DOCUMENT";

  const selectAll = (selected: boolean) =>
    select.mutate(
      { runId, typeName: section.typeName, previewStatus: filter.previewStatus, selected },
      { onSuccess: (result) => toast.success(t(`${P}.selectedCount`, { count: result.count })) },
    );

  const columns: TableColumnsType<OneCPreviewObject> = [
    {
      width: 48,
      render: (_, row) => (
        <Checkbox
          checked={row.selected}
          disabled={!editableRun}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => update.mutate({ id: row.id, selected: event.target.checked })}
        />
      ),
    },
    ...(documents
      ? [
          { title: "№", dataIndex: "docNumber", width: 140 },
          { title: t(`${P}.date`), dataIndex: "docDate", width: 150, render: (value: string | null) => formatDate(value ?? undefined) },
        ]
      : []),
    {
      title: t(`${P}.object`),
      render: (_, row) => (
        <div>
          <div>{row.presentation ?? row.ref}</div>
          {row.isDeleted && <Tag color="red">{t(`${P}.deleted`)}</Tag>}
          {row.hasOverrides && <Tag color="green">{t(`${P}.corrected`)}</Tag>}
        </div>
      ),
    },
    ...(documents
      ? [
          { title: t(`${P}.counterparty`), dataIndex: "counterpartyName" },
          {
            title: t(`${P}.amount`),
            dataIndex: "amount",
            width: 140,
            align: "right" as const,
            render: (value: number | null) => (value === null ? "—" : value.toLocaleString("ru-RU", { minimumFractionDigits: 2 })),
          },
        ]
      : []),
    {
      title: t(`${P}.state`),
      width: 300,
      render: (_, row) => (
        <div className="space-y-1">
          <PreviewTag status={row.previewStatus} note={row.previewNote} />
          {row.status !== "NEW" && (
            <Tag className="ml-1" color={row.status === "IMPORTED" ? "green" : row.status === "ERROR" ? "red" : "default"}>
              {t(`${T}.objectStatuses.${row.status}`)}
            </Tag>
          )}
          <div className="text-xs text-secondary-text">{row.error ?? row.previewNote}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button icon={<ArrowLeft className="size-4" />} onClick={onBack}>
          {t(`${P}.sections`)}
        </Button>
        <div className="font-medium">{section.synonym ?? section.typeName}</div>
        <span className="text-xs text-secondary-text">{section.typeName}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          allowClear
          className="w-56"
          placeholder={t(`${P}.allStates`)}
          value={filter.previewStatus}
          onChange={(previewStatus) => setFilter({ ...filter, previewStatus, page: 1 })}
          options={(["NEW_ENTITY", "MATCHED", "NEEDS_MAPPING", "INVALID", "UNSUPPORTED", "SKIP"] as const).map((status) => ({
            value: status,
            label: t(`${P}.statuses.${status}`),
          }))}
        />
        <Input.Search
          allowClear
          className="w-64!"
          placeholder={t(`${P}.search`)}
          onSearch={(value) => setFilter({ ...filter, search: value.trim() || undefined, page: 1 })}
        />
        {editableRun && (
          <>
            <Button onClick={() => selectAll(true)}>{t(`${P}.selectAll`)}</Button>
            <Button onClick={() => selectAll(false)}>{t(`${P}.unselectAll`)}</Button>
          </>
        )}
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={objects.isFetching}
        columns={columns}
        dataSource={objects.data?.items ?? []}
        onRow={(row) => ({ onClick: () => setOpened(row.id), className: "cursor-pointer" })}
        pagination={{
          current: filter.page,
          pageSize: filter.pageSize,
          total: objects.data?.totalCount ?? 0,
          showSizeChanger: true,
          onChange: (page, pageSize) => setFilter({ ...filter, page, pageSize }),
        }}
      />
      <ObjectDrawer objectId={opened} editableRun={editableRun} onClose={() => setOpened(null)} />
    </div>
  );
}

/** The 1C accounts of the run and the accounts here they go to (6010 → 6020). */
function AccountsTab({ runId, version, editableRun }: { runId: number; version: string; editableRun: boolean }) {
  const { t } = useTranslation();
  const accounts = useOneCRunAccounts(runId, version, true);
  const ours = useOneCOurAccounts(true);
  const save = useSaveOneCAccounts();
  const autoMap = useAutoMapOneCAccounts();
  const groups = useOneCOurGroups(editableRun);
  const createSub = useCreateOneCSubAccount();
  const [changes, setChanges] = useState<Record<string, number | null>>({});
  const [autoMapped, setAutoMapped] = useState<string[] | null>(null);
  // the 1C sub-account being opened here, and the group it goes under
  const [sub, setSub] = useState<{ row: OneCAccountRow; parentId: number | null } | null>(null);
  // only the used ones hold documents back; 1C's unused rest needs nothing, the standard chart's are added
  const unmappedUsed = (accounts.data ?? []).filter((row) => row.accountId == null && row.uses > 0 && !row.fromPreset).length;

  // a sub-account goes under ours numbered as its head (2920.2 → 2920) unless another group is picked
  const openSub = (row: OneCAccountRow) => {
    const head = row.code.includes(".") ? row.code.slice(0, row.code.lastIndexOf(".")) : null;
    setSub({ row, parentId: (groups.data ?? []).find((group) => group.number === head)?.id ?? null });
  };

  const options = (ours.data ?? []).map((account) => ({ value: account.id, label: `${account.number} ${account.name}` }));
  const columns: TableColumnsType<OneCAccountRow> = [
    { title: t(`${P}.account1C`), width: 110, dataIndex: "code", render: (code: string) => <span className="font-mono">{code}</span> },
    { title: t(`${P}.accountName`), dataIndex: "name", render: (name: string | null) => name ?? "—" },
    { title: t(`${P}.uses`), dataIndex: "uses", width: 100, align: "right" },
    {
      title: t(`${P}.accountOurs`),
      width: 380,
      render: (_, row) => (
        <Select
          className="w-full"
          showSearch
          allowClear
          disabled={!editableRun}
          optionFilterProp="label"
          status={(changes[row.code] ?? row.accountId) == null && row.uses > 0 && !row.fromPreset ? "error" : undefined}
          placeholder={t(`${P}.chooseAccount`)}
          value={row.code in changes ? changes[row.code] ?? undefined : row.accountId ?? undefined}
          options={options}
          onChange={(value) => setChanges({ ...changes, [row.code]: value ?? null })}
        />
      ),
    },
    {
      title: t(`${P}.state`),
      width: 210,
      render: (_, row) =>
        row.code in changes ? (
          <Tag color="processing">{t(`${P}.changed`)}</Tag>
        ) : row.fromPreset ? (
          <Tooltip title={t(`${P}.fromPresetHint`)}>
            <Tag color="green">{t(`${P}.fromPreset`)}</Tag>
          </Tooltip>
        ) : row.accountId == null && row.uses > 0 ? (
          <Space size={4} wrap>
            <Tag color="red">{t(`${P}.notMapped`)}</Tag>
            {editableRun && (
              <Button size="small" icon={<FolderPlus className="size-3.5" />} onClick={() => openSub(row)}>
                {t(`${P}.subAccount`)}
              </Button>
            )}
          </Space>
        ) : row.accountId == null && row.uses === 0 ? (
          <Tooltip title={t(`${P}.notNeededHint`)}>
            <Tag>{t(`${P}.notNeeded`)}</Tag>
          </Tooltip>
        ) : row.accountId == null ? (
          <Tag color="red">{t(`${P}.notMapped`)}</Tag>
        ) : row.isMapped ? (
          <Tag color="blue">{t(`${P}.chosen`)}</Tag>
        ) : (
          <Tag>{t(`${P}.sameCode`)}</Tag>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <Alert showIcon type="info" message={t(`${P}.accountsHint`)} />
      {autoMapped && (
        <Alert
          showIcon
          closable
          type={autoMapped.length > 0 ? "success" : "info"}
          message={autoMapped.length > 0 ? t(`${P}.autoMapDone`, { count: autoMapped.length }) : t(`${P}.autoMapNothing`)}
          description={
            autoMapped.length > 0 ? (
              <ul className="list-disc pl-5">
                {autoMapped.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : undefined
          }
          onClose={() => setAutoMapped(null)}
        />
      )}
      {editableRun && (
        <Space wrap>
          <Popconfirm
            title={t(`${P}.autoMap`)}
            description={<div className="max-w-sm">{t(`${P}.autoMapConfirm`)}</div>}
            disabled={unmappedUsed === 0}
            onConfirm={() =>
              autoMap.mutate(runId, {
                onSuccess: (done) => setAutoMapped(done),
                onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
              })
            }
          >
            <Button disabled={unmappedUsed === 0} loading={autoMap.isPending}>
              {t(`${P}.autoMap`)}
              {unmappedUsed > 0 ? ` (${unmappedUsed})` : ""}
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            disabled={Object.keys(changes).length === 0}
            loading={save.isPending}
            onClick={() =>
              save.mutate(
                { runId, items: Object.entries(changes).map(([code, accountId]) => ({ code, accountId })) },
                {
                  onSuccess: () => {
                    setChanges({});
                    toast.success(t(`${P}.accountsSaved`));
                  },
                  onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
                },
              )
            }
          >
            {t(`${P}.saveAccounts`, { count: Object.keys(changes).length })}
          </Button>
        </Space>
      )}
      <Table
        rowKey="code"
        size="small"
        loading={accounts.isLoading}
        columns={columns}
        dataSource={accounts.data ?? []}
        pagination={{ pageSize: 50, hideOnSinglePage: true }}
        locale={{ emptyText: <Empty description={t(`${P}.noAccounts`)} /> }}
      />
      <Modal
        open={sub !== null}
        title={t(`${P}.subAccountTitle`, { code: sub?.row.code ?? "" })}
        okText={t(`${P}.subAccountCreate`)}
        okButtonProps={{ disabled: sub?.parentId == null }}
        confirmLoading={createSub.isPending}
        onCancel={() => setSub(null)}
        onOk={() =>
          sub &&
          createSub.mutate(
            { runId, code: sub.row.code, parentAccountId: sub.parentId },
            {
              onSuccess: (account) => {
                setSub(null);
                toast.success(t(`${P}.subAccountDone`, { number: account.number }));
              },
              onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
            },
          )
        }
      >
        {sub && (
          <div className="space-y-3">
            <div>
              <span className="font-mono">{sub.row.code}</span> {sub.row.name ?? ""}
            </div>
            <div className="text-sm text-secondary-text">{t(`${P}.subAccountHint`)}</div>
            <Select
              className="w-full"
              showSearch
              optionFilterProp="label"
              placeholder={t(`${P}.subAccountParent`)}
              value={sub.parentId ?? undefined}
              options={(groups.data ?? []).map((group) => ({ value: group.id, label: `${group.number} ${group.name}` }))}
              onChange={(value) => setSub({ ...sub, parentId: value ?? null })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

/**
 * The 1C import looked over before it is done: what the base holds by section, each section's
 * objects, each object's fields, rows and entries; pick in or out, correct, map the accounts,
 * then «Import». Only the selected objects are imported.
 */
export default function OneCPreviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const runId = Number(useParams().runId);
  const run = useOneCRun(runId);
  // the run's state and last report: the lists are read again when they move
  const version = `${run.data?.status}:${run.data?.heartbeatAt}`;
  const preview = useOneCPreview(runId, version);
  const select = useSelectOneC();
  const startImport = useStartOneCImport();
  const [section, setSection] = useState<OneCPreviewSection | null>(null);
  const [tab, setTab] = useState<string | null>(null);
  // an object opened from the comparison (its own drawer: the sections keep theirs)
  const [compared, setCompared] = useState<number | null>(null);

  const editableRun = run.data?.status === "PREVIEW";
  const preflight = useOneCPreflight(runId, version, !!run.data);
  const unresolved = preflight.data?.unresolved ?? 0;
  // in the preview what holds the import back comes first
  const activeTab = tab ?? (editableRun && unresolved > 0 ? "preflight" : "sections");
  const sections = preview.data ?? [];
  const selectedTotal = sections.reduce((sum, item) => sum + item.selected, 0);
  const heldBack = sections.reduce((sum, item) => sum + item.needsMapping + item.invalid, 0);
  const current = section && sections.find((item) => item.typeName === section.typeName);

  const counts = (item: OneCPreviewSection) =>
    (
      [
        ["NEW_ENTITY", item.newEntity],
        ["MATCHED", item.matched],
        ["NEEDS_MAPPING", item.needsMapping],
        ["INVALID", item.invalid],
        ["UNSUPPORTED", item.unsupported],
        ["SKIP", item.skip],
      ] as [OneCPreviewStatus, number][]
    )
      .filter(([, count]) => count > 0)
      .map(([status, count]) => (
        <Tag key={status} color={previewColor[status]}>
          {t(`${P}.statuses.${status}`)}: {count}
        </Tag>
      ));

  const sectionColumns: TableColumnsType<OneCPreviewSection> = [
    {
      width: 48,
      render: (_, item) => (
        <Checkbox
          checked={item.selected === item.total && item.total > 0}
          indeterminate={item.selected > 0 && item.selected < item.total}
          disabled={!editableRun}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => select.mutate({ runId, typeName: item.typeName, selected: event.target.checked })}
        />
      ),
    },
    {
      title: t(`${P}.section`),
      render: (_, item) => (
        <div>
          <div className="font-medium">{item.synonym ?? item.typeName}</div>
          <div className="text-xs text-secondary-text">{item.typeName}</div>
        </div>
      ),
    },
    { title: t(`${P}.kind`), width: 140, render: (_, item) => <Tag color={kindColor[item.kind]}>{t(`${P}.kinds.${item.kind}`)}</Tag> },
    {
      title: t(`${P}.count`),
      width: 130,
      align: "right",
      render: (_, item) => (
        <span>
          <b>{item.selected}</b> / {item.total}
        </span>
      ),
    },
    { title: t(`${P}.state`), render: (_, item) => <div className="flex flex-wrap gap-1">{counts(item)}</div> },
    ...(run.data && ["IMPORTING", "DONE", "FAILED"].includes(run.data.status)
      ? [
          {
            title: t(`${P}.result`),
            width: 160,
            render: (_: unknown, item: OneCPreviewSection) => (
              <span>
                <span className="text-green-600">{item.imported}</span> / <span className={item.failed ? "text-red-600" : undefined}>{item.failed}</span>
              </span>
            ),
          },
        ]
      : []),
  ];

  if (!run.data) return <Card className="p-4">…</Card>;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Button type="link" className="px-0!" icon={<ArrowLeft className="size-4" />} onClick={() => navigate("../..", { relative: "path" })}>
            {t(`${T}.title`)}
          </Button>
          <div className="text-base font-semibold">
            {t(`${P}.title`)} №{run.data.id}
            {run.data.dateFrom && (
              <span className="ml-2 font-normal text-secondary-text">
                {formatDate(run.data.dateFrom, "DD.MM.YYYY")} – {formatDate(run.data.dateTo ?? undefined, "DD.MM.YYYY")}
              </span>
            )}
          </div>
          <Tag>{t(`${T}.statuses.${run.data.status}`)}</Tag>
        </div>
        <div className="w-72">
          <RunProgress run={run.data} />
        </div>
        {editableRun && (
          <Popconfirm
            disabled={unresolved > 0}
            title={t(`${P}.importConfirm`, { count: selectedTotal })}
            description={heldBack > 0 ? t(`${P}.importHeldBack`, { count: heldBack }) : undefined}
            onConfirm={() =>
              startImport.mutate(runId, {
                onSuccess: () => toast.success(t(`${P}.importStarted`)),
                onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
              })
            }
          >
            <Tooltip title={unresolved > 0 ? t(`${T}.preflight.importBlocked`, { count: unresolved }) : undefined}>
              <Button type="primary" size="large" icon={<Upload className="size-4" />} disabled={selectedTotal === 0 || unresolved > 0}>
                {t(`${P}.import`, { count: selectedTotal })}
              </Button>
            </Tooltip>
          </Popconfirm>
        )}
      </div>

      {run.data.status === "ANALYZING" || run.data.status === "RECEIVED" ? (
        <Alert showIcon type="info" message={t(`${P}.analyzing`)} />
      ) : run.data.status === "QUEUED" || run.data.status === "EXTRACTING" ? (
        <Alert showIcon type="info" message={t(`${P}.reading`)} />
      ) : null}
      {editableRun && heldBack > 0 && <Alert showIcon type="warning" message={t(`${P}.heldBack`, { count: heldBack })} />}

      <Tabs
        activeKey={activeTab}
        onChange={setTab}
        items={[
          ...((preflight.data?.items.length ?? 0) > 0 || editableRun
            ? [
                {
                  key: "preflight",
                  label: (
                    <span>
                      {t(`${T}.preflight.tab`)}
                      {unresolved > 0 && (
                        <Tag color="red" className="ml-2!">
                          {unresolved}
                        </Tag>
                      )}
                    </span>
                  ),
                  children: (
                    <PreflightTab runId={runId} version={version} editable={editableRun} onOpen={setCompared} />
                  ),
                },
              ]
            : []),
          {
            key: "sections",
            label: t(`${P}.sections`),
            children: current ? (
              <SectionObjects runId={runId} section={current} version={version} editableRun={editableRun} onBack={() => setSection(null)} />
            ) : (
              <Table
                rowKey="typeName"
                size="small"
                loading={preview.isLoading}
                columns={sectionColumns}
                dataSource={sections}
                pagination={false}
                onRow={(item) => ({ onClick: () => setSection(item), className: "cursor-pointer" })}
                locale={{ emptyText: <Empty description={t(`${P}.empty`)} /> }}
              />
            ),
          },
          {
            key: "accounts",
            label: t(`${P}.accounts`),
            children: <AccountsTab runId={runId} version={version} editableRun={editableRun} />,
          },
          ...(["DONE", "FAILED", "IMPORTING"].includes(run.data.status)
            ? [
                {
                  key: "compare",
                  label: t(`${T}.compare.tab`),
                  children: <CompareTab runId={runId} version={version} onOpen={setCompared} />,
                },
              ]
            : []),
        ]}
      />
      <ObjectDrawer objectId={compared} editableRun={false} onClose={() => setCompared(null)} />
    </Card>
  );
}
