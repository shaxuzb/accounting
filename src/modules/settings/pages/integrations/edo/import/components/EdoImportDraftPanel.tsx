import {
  Alert,
  Button,
  Empty,
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
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  Copy,
  ExternalLink,
  FileText,
  PackageCheck,
  PauseCircle,
  Play,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  SkipForward,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  safeErrorLabel,
} from "./presentation";

interface EdoImportDraftPanelProps {
  jobId: number;
  jobStatus?: EdoImportJobStatus;
}

const failureActionLabel = (action: EdoImportDraftFailureAction) =>
  action === "MARK_DUPLICATE" ? "Takroriy deb belgilash" : "O‘tkazib yuborish";

export default function EdoImportDraftPanel({
  jobId,
  jobStatus,
}: EdoImportDraftPanelProps) {
  const plan = useEdoImportDraftPlan(jobId);
  const importDrafts = useImportEdoDrafts(jobId);
  const startBulk = useStartEdoBulkImport(jobId);
  const [bulkEnabled, setBulkEnabled] = useState(
    jobStatus === "IMPORTING" || jobStatus === "PARTIAL",
  );
  const shouldLoadBulk =
    bulkEnabled || jobStatus === "IMPORTING" || jobStatus === "PARTIAL";
  const bulk = useEdoBulkImportStatus(jobId, shouldLoadBulk);
  const cancelBulk = useCancelEdoBulkImport(jobId);

  const bulkStatus = bulk.data?.status;
  const isBulkPaused = bulkStatus === "PAUSED";
  const isImporting =
    isActiveBulkImport(bulkStatus) || jobStatus === "IMPORTING";
  const isImportLocked = isImporting || isBulkPaused;
  const hasImportErrors =
    (plan.data?.failedCount ?? 0) > 0 ||
    (bulk.data?.failedCount ?? 0) > 0 ||
    jobStatus === "PARTIAL";
  const resultState = isBulkPaused
    ? "paused"
    : isImporting
      ? "processing"
      : hasImportErrors
        ? "error"
        : (plan.data?.readyCount ?? 0) > 0
          ? "ready"
          : "blocked";

  const importDisabledReason = plan.data
    ? isBulkPaused
      ? "Fon importi vaqtincha to‘xtagan. Avval davom ettiring yoki bekor qiling."
      : isImporting
        ? "Import jarayoni davom etmoqda."
        : plan.data.readyCount === 0 && plan.data.mappingRequiredCount > 0
          ? `${plan.data.mappingRequiredCount} ta hujjat moslashtirishni kutmoqda.`
          : plan.data.readyCount === 0 && plan.data.duplicateCount > 0
            ? "Yangi import qilinadigan hujjat yo‘q: mavjud hujjatlar takroriy."
            : plan.data.readyCount === 0
              ? "Importga tayyor hujjat topilmadi."
              : null
    : null;

  const runDraftImport = () => {
    if (!plan.data || plan.data.readyCount <= 0) {
      return;
    }
    const batchSize = Math.min(50, plan.data.readyCount);
    Modal.confirm({
      title: "Importni boshlash",
      content: `${Math.min(batchSize, plan.data.readyCount)} ta tayyor hujjat Purchase qoralamasiga aylantiriladi. Posting, to‘lov yoki ombor harakati bajarilmaydi.`,
      okText: "Importni boshlash",
      cancelText: "Bekor qilish",
      onOk: async () => {
        try {
          const result = await importDrafts.mutateAsync({
            confirm: true,
            expectedImportPlanHash: plan.data!.importPlanHash,
            batchSize,
          });
          toast.success(
            `${result.createdDraftCount} ta hujjat import qilindi.`,
          );
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  const runImport = () => {
    if (!plan.data || plan.data.readyCount <= 0) return;

    // Small imports return immediately; larger imports run in the background
    // so the user does not need to repeat the same action for each batch.
    if (plan.data.readyCount > 50) {
      runBulkImport();
      return;
    }

    runDraftImport();
  };

  const runBulkImport = () => {
    if (!plan.data) return;
    const isResuming = bulk.data?.status === "PAUSED";
    Modal.confirm({
      title: isResuming
        ? "Fon importini davom ettirish"
        : "Fon rejimidagi importni boshlash",
      content: isResuming
        ? "Import to‘xtagan joyidan davom etadi. Oldin yaratilgan Draft’lar takrorlanmaydi."
        : "Tayyor hujjatlar 50 tadan avtomatik qayta ishlanadi. Noto‘g‘ri qatorlar o‘tkazib yuboriladi.",
      okText: isResuming ? "Davom ettirish" : "Fon importini boshlash",
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
          toast.success("Fon importi boshlandi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  const stopBulkImport = () => {
    Modal.confirm({
      title: "Bulk importni to‘xtatish",
      content:
        "Fon importi to‘xtatiladi. Allaqachon yaratilgan Draft’lar saqlanadi, qolgan hujjatlar import qilinmaydi.",
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
              <h2 className="font-semibold text-heading">
                Purchase’ga import natijasi
              </h2>
            </div>
            <p className="mt-1 text-sm text-secondary-text">
              {resultState === "paused"
                ? "Import vaqtincha to‘xtagan. Davom ettirish yoki bekor qilishni tanlang."
                : resultState === "processing"
                  ? "Hujjatlar import qilinmoqda. Jarayon tugaguncha sahifani yopmang."
                  : resultState === "error"
                    ? `Import tugadi. ${formatImportNumber(Math.max(plan.data?.failedCount ?? 0, bulk.data?.failedCount ?? 0))} ta hujjat import qilinmadi.`
                    : resultState === "ready"
                      ? "Tekshiruv yakunlandi. Tayyor hujjatlar Purchase qoralamasiga aylantiriladi."
                      : "Tekshiruvdan o‘tgan hujjatlar Purchase qoralamasiga aylantiriladi. Bu hali posting emas."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DraftStateBadge state={resultState} />
            <Button
              icon={<RefreshCw className="size-4" />}
              loading={plan.isFetching}
              onClick={() => void plan.refetch()}
            >
              Yangilash
            </Button>
          </div>
        </div>

        {plan.isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} className="mt-4" />
        ) : plan.isError ? (
          <Alert
            className="mt-4"
            type="error"
            showIcon
            message={getImportErrorMessage(plan.error)}
          />
        ) : plan.data ? (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {[
                {
                  label: "Jami",
                  value: plan.data.totalCandidates,
                  icon: FileText,
                  tone: "neutral",
                },
                {
                  label: "Tayyor",
                  value: plan.data.readyCount,
                  icon: CheckCircle2,
                  tone: "success",
                },
                {
                  label: "Moslashtirish kerak",
                  value: plan.data.mappingRequiredCount,
                  icon: SlidersHorizontal,
                  tone: "warning",
                },
                {
                  label: "Takroriy",
                  value: plan.data.duplicateCount,
                  icon: Copy,
                  tone: "purple",
                },
                {
                  label: "Import qilingan",
                  value:
                    bulk.data?.createdDraftCount ?? plan.data.importedCount,
                  icon: Upload,
                  tone: "brand",
                },
                {
                  label: "Xato",
                  value: Math.max(
                    plan.data.failedCount,
                    bulk.data?.failedCount ?? 0,
                  ),
                  icon: AlertCircle,
                  tone: "danger",
                },
                {
                  label: "O‘tkazib yuborilgan",
                  value: Math.max(
                    plan.data.skippedCount,
                    bulk.data?.skippedCount ?? 0,
                  ),
                  icon: SkipForward,
                  tone: "neutral",
                },
              ].map((stat) => (
                <DraftStatCard key={stat.label} {...stat} />
              ))}
            </div>

            {plan.data.readyCount === 0 ? (
              <Alert
                type="warning"
                showIcon
                message="Hozircha importni boshlash mumkin emas"
                description={
                  plan.data.mappingRequiredCount > 0
                    ? `${plan.data.mappingRequiredCount} ta hujjat moslashtirishni kutmoqda. Avval moslashtirish bo‘limidagi muammolarni hal qiling.`
                    : "Importga tayyor hujjatlar topilmadi. Rejani yangilang yoki tekshiruv natijasini qayta ko‘ring."
                }
              />
            ) : null}

            {hasImportErrors && (
              <Alert
                type="error"
                showIcon
                message={`${formatImportNumber(Math.max(plan.data.failedCount, bulk.data?.failedCount ?? 0))} ta hujjat import qilinmadi`}
                description="Import xatolari quyidagi ro‘yxatda ko‘rsatiladi. Qarorni tanlang yoki qayta urinishni bosing."
              />
            )}

            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 font-semibold text-heading">
                  <PackageCheck className="size-4 text-brand" />
                  READY qiymatlar
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Amount label="Net" value={plan.data.readyNetAmount} />
                  <Amount label="QQS" value={plan.data.readyVatAmount} />
                  <Amount
                    label="Jami"
                    value={plan.data.readyTotalAmount}
                    emphasized
                  />
                </div>
                <div className="mt-4 text-xs text-secondary-text">
                  Davr:{" "}
                  {plan.data.earliestDocumentDate
                    ? dayjs(plan.data.earliestDocumentDate).format("DD.MM.YYYY")
                    : "—"}{" "}
                  —{" "}
                  {plan.data.latestDocumentDate
                    ? dayjs(plan.data.latestDocumentDate).format("DD.MM.YYYY")
                    : "—"}
                </div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 font-semibold text-heading">
                  <FileText className="size-4 text-brand" />
                  Providerlar
                </div>
                <div className="mt-3 space-y-2">
                  {plan.data.providers.length > 0 ? (
                    plan.data.providers.map((provider) => (
                      <div
                        key={provider.providerCode}
                        className="flex items-center justify-between rounded-lg bg-surface-muted/45 px-3 py-2"
                      >
                        <span className="font-medium text-heading">
                          {provider.providerCode}
                        </span>
                        <Tag color="blue" className="m-0">
                          {provider.readyCount} ta tayyor
                        </Tag>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-secondary-text">
                      Provider ma’lumoti hali yo‘q.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-brand/15 bg-brand-soft p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-heading">
                      <Play className="size-4 text-brand" />
                      Import jarayoni
                    </div>
                    <p className="mt-1 text-sm text-secondary-text">
                      {isBulkPaused
                        ? "Import vaqtincha to‘xtagan. Davom ettirish yoki bekor qilishni tanlang."
                        : isImporting
                          ? "Import davom etmoqda. Jarayon tugashini kuting."
                          : "Tayyor hujjatlar Purchase qoralamasiga import qilinadi."}
                    </p>
                  </div>
                  <Button
                    type="primary"
                  icon={<Play className="size-4" />}
                  disabled={plan.data.readyCount <= 0 || isImportLocked}
                  loading={importDrafts.isPending || startBulk.isPending}
                  title={importDisabledReason ?? "Tayyor hujjatlarni import qilish"}
                  aria-describedby={
                    importDisabledReason ? "edo-import-disabled-reason" : undefined
                  }
                  onClick={runImport}
                  >
                    Importni boshlash
                </Button>
              </div>
              {importDisabledReason && (
                <div
                  id="edo-import-disabled-reason"
                  className="mt-3 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-xs text-secondary-text"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                  <span>{importDisabledReason}</span>
                </div>
              )}
              <p className="mt-3 text-xs text-secondary-text">
                  {plan.data.readyCount > 50
                    ? "Ko‘p hujjat bo‘lgani uchun import fon rejimida avtomatik davom etadi."
                    : "Import tugagach hujjatlar Purchase qoralamasi sifatida saqlanadi."}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 font-semibold text-heading">
                  {hasImportErrors ? (
                    <CircleAlert className="size-4 text-danger" />
                  ) : (
                    <CircleCheck className="size-4 text-success" />
                  )}
                  Import xatolari
                </div>
                <p className="mt-2 text-sm text-secondary-text">
                  {hasImportErrors
                    ? "Xato chiqqan hujjatlar pastdagi ro‘yxatda ko‘rsatiladi."
                    : "Hozirgacha xato aniqlanmadi. Hujjatlar importga tayyor."}
                </p>
                {hasImportErrors && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                    <AlertCircle className="size-4" />
                    {formatImportNumber(
                      Math.max(
                        plan.data.failedCount,
                        bulk.data?.failedCount ?? 0,
                      ),
                    )}{" "}
                    ta xato
                  </div>
                )}
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
                <RefreshCw className="size-4 text-brand" />
                <h2 className="font-semibold text-heading">Import jarayoni</h2>
                {importStatusTag(bulk.data?.status)}
              </div>
              <p className="mt-1 text-sm text-secondary-text">
                Fon rejimidagi import holati har 3 soniyada yangilanadi.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                icon={<RefreshCw className="size-4" />}
                loading={bulk.isFetching}
                onClick={() => void bulk.refetch()}
              >
                Yangilash
              </Button>
              {bulk.data?.status === "PAUSED" && (
                <Button
                  type="primary"
                  icon={<Play className="size-4" />}
                  loading={startBulk.isPending}
                  onClick={runBulkImport}
                >
                  Davom ettirish
                </Button>
              )}
              {(isActiveBulkImport(bulk.data?.status) ||
                bulk.data?.status === "PAUSED") && (
                <Button
                  danger
                  icon={<PauseCircle className="size-4" />}
                  loading={cancelBulk.isPending}
                  onClick={stopBulkImport}
                >
                  To‘xtatish
                </Button>
              )}
            </div>
          </div>
          {bulk.isLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} className="mt-4" />
          ) : bulk.isError ? (
            <Alert
              className="mt-4"
              type="error"
              showIcon
              message={getImportErrorMessage(bulk.error)}
            />
          ) : bulk.data ? (
            <div className="mt-4 space-y-4">
              <Progress
                percent={getBulkProgress(
                  bulk.data.processedCount,
                  bulk.data.remainingReadyCount,
                )}
                status={bulk.data.status === "PAUSED" ? "exception" : "active"}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {[
                  ["Qayta ishlangan", bulk.data.processedCount],
                  ["Yaratilgan draft", bulk.data.createdDraftCount],
                  ["Mavjud draft", bulk.data.reusedDraftCount],
                  ["Takroriy", bulk.data.duplicateCount],
                  ["O‘tkazib yuborilgan", bulk.data.skippedCount],
                  ["Xato", bulk.data.failedCount],
                  ["Qolgan", bulk.data.remainingReadyCount],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg bg-surface-muted/45 p-3"
                  >
                    <div className="font-semibold text-heading">
                      {formatImportNumber(Number(value))}
                    </div>
                    <div className="mt-1 text-xs text-secondary-text">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              {bulk.data.lastSafeErrorCode && (
                <Alert
                  type="warning"
                  showIcon
                  message={`Xavfsiz xato kodi: ${bulk.data.lastSafeErrorCode}`}
                />
              )}
            </div>
          ) : null}
        </Card>
      )}

      <FailureSection jobId={jobId} />
    </div>
  );
}

function DraftStatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  const toneClass =
    {
      neutral: "bg-surface-muted text-secondary-text",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      purple: "bg-purple-500/10 text-purple-600",
      brand: "bg-brand-soft text-brand",
      danger: "bg-danger/10 text-danger",
    }[tone] ?? "bg-surface-muted text-secondary-text";

  return (
    <div className="rounded-xl border border-border/70 bg-surface-muted/45 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xl font-semibold tabular-nums text-heading">
          {formatImportNumber(value)}
        </div>
        <span
          aria-hidden
          className={`grid size-7 shrink-0 place-items-center rounded-lg ${toneClass}`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-1 text-xs leading-4 text-secondary-text">{label}</div>
    </div>
  );
}

function DraftStateBadge({ state }: { state: string }) {
  const config = {
    ready: {
      label: "Importga tayyor",
      icon: CircleCheck,
      className: "border-success/30 bg-success/10 text-success",
    },
    processing: {
      label: "Import qilinmoqda",
      icon: RefreshCw,
      className: "border-brand/30 bg-brand-soft text-brand",
    },
    paused: {
      label: "Import pauzada",
      icon: PauseCircle,
      className: "border-warning/30 bg-warning/10 text-warning",
    },
    error: {
      label: "Importda xatolik",
      icon: CircleAlert,
      className: "border-danger/30 bg-danger/10 text-danger",
    },
    blocked: {
      label: "Import kutilmoqda",
      icon: CircleAlert,
      className: "border-warning/30 bg-warning/10 text-warning",
    },
  }[state] ?? {
    label: "Import kutilmoqda",
    icon: CircleAlert,
    className: "border-warning/30 bg-warning/10 text-warning",
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${config.className}`}
    >
      <Icon
        className={`size-3.5 ${state === "processing" ? "animate-spin" : ""}`}
      />
      {config.label}
    </span>
  );
}

function getBulkProgress(processed: number, remaining: number) {
  const total = processed + remaining;
  return total > 0 ? Math.round((processed / total) * 100) : 100;
}

function Amount({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-secondary-text">{label}</div>
      <div
        className={`mt-1 tabular-nums ${emphasized ? "text-lg font-semibold text-brand" : "font-medium text-heading"}`}
      >
        {formatImportNumber(value)}
      </div>
    </div>
  );
}

function FailureSection({ jobId }: { jobId: number }) {
  const navigate = useNavigate();
  const failures = useEdoImportDraftFailures(jobId);
  const apply = useApplyEdoImportDraftFailures(jobId);
  const [actions, setActions] = useState<
    Record<number, EdoImportDraftFailureAction>
  >({});

  const records = failures.data?.items ?? [];
  const columns = useMemo<TableColumnsType<EdoImportDraftFailureItemDto>>(
    () => [
      { title: "Hujjat ID", dataIndex: "candidateId", width: 110 },
      {
        title: "Hujjat",
        dataIndex: "documentNumber",
        render: (value) => value || "—",
      },
      {
        title: "Sabab",
        dataIndex: "safeErrorCode",
        render: (value) => <Tag color="red">{safeErrorLabel(value)}</Tag>,
      },
      {
        title: "Marking",
        key: "marking",
        width: 130,
        render: (_, record) =>
          `${record.usedMarkingCount} / ${record.totalMarkingCount}`,
      },
      {
        title: "Purchase",
        dataIndex: "existingPurchaseIds",
        render: (ids: number[]) =>
          ids.length ? (
            <div className="flex flex-wrap gap-1">
              {ids.map((id) => (
                <Button
                  key={id}
                  type="link"
                  size="small"
                  icon={<ExternalLink className="size-3" />}
                  onClick={() => navigate(`/main/purchases/purchase/${id}`)}
                >
                  #{id}
                </Button>
              ))}
            </div>
          ) : (
            "—"
          ),
      },
      {
        title: "Qaror",
        key: "action",
        width: 180,
        render: (_, record) => (
          <Select
            value={actions[record.candidateId]}
            placeholder="Tanlang"
            options={[
              { value: "SKIP", label: failureActionLabel("SKIP") },
              {
                value: "MARK_DUPLICATE",
                label: failureActionLabel("MARK_DUPLICATE"),
              },
            ]}
            onChange={(value) =>
              setActions((current) => ({
                ...current,
                [record.candidateId]: value,
              }))
            }
            className="w-full"
          />
        ),
      },
      {
        title: "Qayta urinish",
        key: "retry",
        width: 135,
        render: (_, record) => (
          <RequeueButton jobId={jobId} candidateId={record.candidateId} />
        ),
      },
    ],
    [actions, jobId, navigate],
  );

  const submit = () => {
    if (!failures.data) return;
    const items = Object.entries(actions).map(([candidateId, action]) => ({
      candidateId: Number(candidateId),
      action,
    }));
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
          await apply.mutateAsync({
            confirm: true,
            expectedFailureHash: failures.data!.failureHash,
            items,
          });
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
        <div>
          <h2 className="font-semibold text-heading">Import xatolari</h2>
          <p className="mt-1 text-sm text-secondary-text">
            Import paytida xato chiqqan hujjatlar shu yerda ko‘rsatiladi. Ularni
            qayta navbatga qo‘yish yoki o‘tkazib yuborish mumkin.
          </p>
        </div>
        <Button
          icon={<RefreshCw className="size-4" />}
          loading={failures.isFetching}
          onClick={() => void failures.refetch()}
        >
          Yangilash
        </Button>
      </div>
      {failures.isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : failures.isError ? (
        <Alert
          type="error"
          showIcon
          message={getImportErrorMessage(failures.error)}
        />
      ) : (
        <>
          <Table
            rowKey="candidateId"
            size="small"
            columns={columns}
            dataSource={records}
            pagination={false}
            locale={{
              emptyText: <Empty description="Import xatosi aniqlanmadi" />,
            }}
            scroll={{ x: 980 }}
          />
          {records.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                type="primary"
                disabled={!Object.keys(actions).length}
                loading={apply.isPending}
                onClick={submit}
              >
                Tanlangan qarorlarni qo‘llash
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function RequeueButton({
  jobId,
  candidateId,
}: {
  jobId: number;
  candidateId: number;
}) {
  const requeue = useRequeueEdoImportDraft(jobId, candidateId);
  const run = async () => {
    try {
      const result = await requeue.mutateAsync({ confirm: true });
      toast.success(
        result.requeued
          ? `Candidate #${candidateId} qayta navbatga qo‘yildi.`
          : `Candidate #${candidateId} holati o‘zgarmadi.`,
      );
    } catch (error) {
      toast.error(getImportErrorMessage(error));
    }
  };
  return (
    <Button
      size="small"
      aria-label="Qayta navbatga qo‘yish"
      icon={<RotateCcw className="size-3.5" />}
      loading={requeue.isPending}
      onClick={() => void run()}
    >
      Qayta urinish
    </Button>
  );
}
