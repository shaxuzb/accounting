import {
  Alert,
  Button,
  Empty,
  InputNumber,
  Modal,
  Progress,
  Select,
  Skeleton,
  Table,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import {
  ExternalLink,
  PackageCheck,
  PauseCircle,
  Play,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import {
  useApplyEdoImportDraftFailures,
  useCancelEdoBulkImport,
  useEdoBulkImportStatus,
  useEdoImportDraftFailures,
  useEdoImportDraftPlan,
  useImportEdoDrafts,
  useRequeueEdoImportDraft,
  useStartEdoBulkImport,
} from "../hooks";
import type {
  EdoImportDraftFailureAction,
  EdoImportDraftFailureItemDto,
  EdoImportJobStatus,
} from "../types";
import {
  formatImportNumber,
  getImportErrorMessage,
  importStatusTag,
  isActiveBulkImport,
} from "./presentation";

interface EdoImportDraftPanelProps {
  jobId: number;
  jobStatus?: EdoImportJobStatus;
}

export default function EdoImportDraftPanel({
  jobId,
  jobStatus,
}: EdoImportDraftPanelProps) {
  const plan = useEdoImportDraftPlan(jobId);
  const importDrafts = useImportEdoDrafts(jobId);
  const startBulk = useStartEdoBulkImport(jobId);
  const [batchSize, setBatchSize] = useState<number>(50);
  const [bulkEnabled, setBulkEnabled] = useState(
    jobStatus === "IMPORTING" || jobStatus === "PARTIAL",
  );
  const shouldLoadBulk =
    bulkEnabled || jobStatus === "IMPORTING" || jobStatus === "PARTIAL";
  const bulk = useEdoBulkImportStatus(jobId, shouldLoadBulk);
  const cancelBulk = useCancelEdoBulkImport(jobId);

  const runDraftImport = () => {
    if (!plan.data || batchSize < 1 || batchSize > 50) {
      toast.error("Batch size 1–50 oralig‘ida bo‘lishi kerak.");
      return;
    }
    Modal.confirm({
      title: "Purchase Draft importini boshlash",
      content: `${Math.min(batchSize, plan.data.readyCount)} tagacha READY candidate qayta ishlanadi. Posting, payment yoki warehouse movement bajarilmaydi.`,
      okText: "Draft yaratish",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          const result = await importDrafts.mutateAsync({
            confirm: true,
            expectedImportPlanHash: plan.data!.importPlanHash,
            batchSize,
          });
          toast.success(`${result.createdDraftCount} ta Draft yaratildi.`);
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  const runBulkImport = () => {
    if (!plan.data) return;
    Modal.confirm({
      title: "Bulk Draft importini boshlash",
      content: "READY candidate’lar 50 tadan fon rejimida import qilinadi. Noto‘g‘ri qatorlar SKIP qilinadi.",
      okText: "Bulk importni boshlash",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await startBulk.mutateAsync({
            confirm: true,
            expectedImportPlanHash: plan.data!.importPlanHash,
            batchSize: 50,
            lineValuesInvalidPolicy: "SKIP",
            markingAlreadyUsedPolicy:
              "MARK_DUPLICATE_IF_ALL_SAME_PURCHASE_ELSE_SKIP",
          });
          setBulkEnabled(true);
          toast.success("Bulk import boshlandi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  const stopBulkImport = () => {
    Modal.confirm({
      title: "Bulk importni to‘xtatish",
      content: "Qayta ishlanayotgan batch tugagach import bekor qilinadi.",
      okText: "To‘xtatish",
      okButtonProps: { danger: true },
      cancelText: "Davom ettirish",
      onOk: async () => {
        try {
          await cancelBulk.mutateAsync();
          toast.success("Bulk importni bekor qilish so‘rovi yuborildi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="size-5 text-brand" />
              <h2 className="font-semibold text-heading">Purchase Draft rejasi</h2>
            </div>
            <p className="mt-1 text-sm text-secondary-text">
              Faqat READY candidate’lar qoralama xarid hujjatiga aylanadi.
            </p>
          </div>
          <Button icon={<RefreshCw className="size-4" />} loading={plan.isFetching} onClick={() => void plan.refetch()}>
            Yangilash
          </Button>
        </div>

        {plan.isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} className="mt-4" />
        ) : plan.isError ? (
          <Alert className="mt-4" type="error" showIcon message={getImportErrorMessage(plan.error)} />
        ) : plan.data ? (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {[
                ["Jami", plan.data.totalCandidates],
                ["Tayyor", plan.data.readyCount],
                ["Mapping", plan.data.mappingRequiredCount],
                ["Duplicate", plan.data.duplicateCount],
                ["Import", plan.data.importedCount],
                ["Xato", plan.data.failedCount],
                ["Skip", plan.data.skippedCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-surface-muted/50 p-3">
                  <div className="text-xl font-semibold tabular-nums text-heading">{formatImportNumber(Number(value))}</div>
                  <div className="mt-1 text-xs text-secondary-text">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary-text">READY qiymatlar</div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Amount label="Net" value={plan.data.readyNetAmount} />
                  <Amount label="QQS" value={plan.data.readyVatAmount} />
                  <Amount label="Jami" value={plan.data.readyTotalAmount} emphasized />
                </div>
                <div className="mt-4 text-xs text-secondary-text">
                  Davr: {plan.data.earliestDocumentDate ? dayjs(plan.data.earliestDocumentDate).format("DD.MM.YYYY") : "—"} — {plan.data.latestDocumentDate ? dayjs(plan.data.latestDocumentDate).format("DD.MM.YYYY") : "—"}
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary-text">Providerlar</div>
                <div className="mt-3 space-y-2">
                  {plan.data.providers.map((provider) => (
                    <div key={provider.providerCode} className="flex items-center justify-between rounded-lg bg-surface-muted/45 px-3 py-2">
                      <span className="font-medium text-heading">{provider.providerCode}</span>
                      <Tag color="blue" className="m-0">{provider.readyCount} READY</Tag>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-brand/15 bg-brand-soft p-4">
              <label className="space-y-2 text-sm font-medium text-heading">
                <span>Oddiy import batch size</span>
                <InputNumber min={1} max={50} precision={0} value={batchSize} onChange={(value) => setBatchSize(value ?? 1)} className="w-36 bg-primary-bg" />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="primary"
                  icon={<Play className="size-4" />}
                  disabled={plan.data.readyCount <= 0}
                  loading={importDrafts.isPending}
                  onClick={runDraftImport}
                >
                  Draft import
                </Button>
                <Button
                  icon={<PackageCheck className="size-4" />}
                  disabled={plan.data.readyCount <= 0 || isActiveBulkImport(bulk.data?.status)}
                  loading={startBulk.isPending}
                  onClick={runBulkImport}
                >
                  Bulk import · 50
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {shouldLoadBulk && (
        <Card className="border border-border p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-heading">Bulk import progressi</h2>
                {importStatusTag(bulk.data?.status)}
              </div>
              <p className="mt-1 text-sm text-secondary-text">Faol holatlarda har 15 soniyada yangilanadi.</p>
            </div>
            <div className="flex gap-2">
              <Button icon={<RefreshCw className="size-4" />} loading={bulk.isFetching} onClick={() => void bulk.refetch()}>Yangilash</Button>
              {isActiveBulkImport(bulk.data?.status) && (
                <Button danger icon={<PauseCircle className="size-4" />} loading={cancelBulk.isPending} onClick={stopBulkImport}>To‘xtatish</Button>
              )}
            </div>
          </div>
          {bulk.isLoading ? <Skeleton active paragraph={{ rows: 3 }} className="mt-4" /> : bulk.isError ? (
            <Alert className="mt-4" type="error" showIcon message={getImportErrorMessage(bulk.error)} />
          ) : bulk.data ? (
            <div className="mt-4 space-y-4">
              <Progress
                percent={bulk.data.processedCount + bulk.data.remainingReadyCount > 0 ? Math.round((bulk.data.processedCount / (bulk.data.processedCount + bulk.data.remainingReadyCount)) * 100) : 100}
                status={bulk.data.status === "PAUSED" ? "exception" : "active"}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {[
                  ["Processed", bulk.data.processedCount],
                  ["Created", bulk.data.createdDraftCount],
                  ["Reused", bulk.data.reusedDraftCount],
                  ["Duplicate", bulk.data.duplicateCount],
                  ["Skipped", bulk.data.skippedCount],
                  ["Failed", bulk.data.failedCount],
                  ["Remaining", bulk.data.remainingReadyCount],
                ].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-surface-muted/45 p-3"><div className="font-semibold text-heading">{value}</div><div className="mt-1 text-xs text-secondary-text">{label}</div></div>)}
              </div>
              {bulk.data.lastSafeErrorCode && <Alert type="warning" showIcon message={`Xavfsiz xato kodi: ${bulk.data.lastSafeErrorCode}`} />}
            </div>
          ) : null}
        </Card>
      )}

      <FailureSection jobId={jobId} />
    </div>
  );
}

function Amount({ label, value, emphasized = false }: { label: string; value: number; emphasized?: boolean }) {
  return <div><div className="text-xs text-secondary-text">{label}</div><div className={`mt-1 tabular-nums ${emphasized ? "text-lg font-semibold text-brand" : "font-medium text-heading"}`}>{formatImportNumber(value)}</div></div>;
}

function FailureSection({ jobId }: { jobId: number }) {
  const navigate = useNavigate();
  const failures = useEdoImportDraftFailures(jobId);
  const apply = useApplyEdoImportDraftFailures(jobId);
  const [actions, setActions] = useState<Record<number, EdoImportDraftFailureAction>>({});

  const records = failures.data?.items ?? [];
  const columns = useMemo<TableColumnsType<EdoImportDraftFailureItemDto>>(() => [
    { title: "Candidate", dataIndex: "candidateId", width: 110 },
    { title: "Hujjat", dataIndex: "documentNumber", render: (value) => value || "—" },
    { title: "Safe error", dataIndex: "safeErrorCode", render: (value) => <Tag color="red">{value}</Tag> },
    { title: "Marking", key: "marking", width: 130, render: (_, record) => `${record.usedMarkingCount} / ${record.totalMarkingCount}` },
    {
      title: "Purchase",
      dataIndex: "existingPurchaseIds",
      render: (ids: number[]) => ids.length ? <div className="flex flex-wrap gap-1">{ids.map((id) => <Button key={id} type="link" size="small" icon={<ExternalLink className="size-3" />} onClick={() => navigate(`/main/purchases/purchase/${id}`)}>#{id}</Button>)}</div> : "—",
    },
    {
      title: "Qaror",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Select
          value={actions[record.candidateId]}
          placeholder="Tanlang"
          options={[{ value: "SKIP", label: "SKIP" }, { value: "MARK_DUPLICATE", label: "MARK_DUPLICATE" }]}
          onChange={(value) => setActions((current) => ({ ...current, [record.candidateId]: value }))}
          className="w-full"
        />
      ),
    },
    { title: "Retry", key: "retry", width: 100, render: (_, record) => <RequeueButton jobId={jobId} candidateId={record.candidateId} /> },
  ], [actions, jobId, navigate]);

  const submit = () => {
    if (!failures.data) return;
    const items = Object.entries(actions).map(([candidateId, action]) => ({ candidateId: Number(candidateId), action }));
    if (!items.length) {
      toast.error("Kamida bitta failure uchun qaror tanlang.");
      return;
    }
    Modal.confirm({
      title: "Failure qarorlarini qo‘llash",
      content: `${items.length} ta candidate holati o‘zgartiriladi.`,
      okText: "Qo‘llash",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          await apply.mutateAsync({ confirm: true, expectedFailureHash: failures.data!.failureHash, items });
          setActions({});
          toast.success("Failure qarorlari qo‘llandi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  return (
    <Card className="border border-border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold text-heading">Draft import xatolari</h2><p className="mt-1 text-sm text-secondary-text">Raw marking kodlari ko‘rsatilmaydi; faqat xavfsiz xato kodi va Purchase linklari ishlatiladi.</p></div>
        <Button icon={<RefreshCw className="size-4" />} loading={failures.isFetching} onClick={() => void failures.refetch()}>Yangilash</Button>
      </div>
      {failures.isLoading ? <Skeleton active paragraph={{ rows: 4 }} /> : failures.isError ? <Alert type="error" showIcon message={getImportErrorMessage(failures.error)} /> : (
        <>
          <Table rowKey="candidateId" size="small" columns={columns} dataSource={records} pagination={false} locale={{ emptyText: <Empty description="Draft import xatosi yo‘q" /> }} scroll={{ x: 980 }} />
          {records.length > 0 && <div className="mt-4 flex justify-end"><Button type="primary" disabled={!Object.keys(actions).length} loading={apply.isPending} onClick={submit}>Tanlangan qarorlarni qo‘llash</Button></div>}
        </>
      )}
    </Card>
  );
}

function RequeueButton({ jobId, candidateId }: { jobId: number; candidateId: number }) {
  const requeue = useRequeueEdoImportDraft(jobId, candidateId);
  const run = async () => {
    try {
      const result = await requeue.mutateAsync({ confirm: true });
      toast.success(result.requeued ? `Candidate #${candidateId} qayta navbatga qo‘yildi.` : `Candidate #${candidateId} holati o‘zgarmadi.`);
    } catch (error) {
      toast.error(getImportErrorMessage(error));
    }
  };
  return <Button type="text" aria-label="Qayta navbatga qo‘yish" icon={<RotateCcw className="size-4" />} loading={requeue.isPending} onClick={() => void run()} />;
}
