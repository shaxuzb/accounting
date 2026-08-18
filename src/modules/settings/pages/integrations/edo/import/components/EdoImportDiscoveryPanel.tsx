import {
  Alert,
  Button,
  DatePicker,
  Modal,
  Progress,
  Skeleton,
  Spin,
} from "antd";
import { isAxiosError } from "axios";
import dayjs, { type Dayjs } from "dayjs";
import { CalendarRange, CheckCircle2, ClipboardCopy, PauseCircle, Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { edoImportService } from "../api";
import {
  useCancelEdoImportJob,
  useCreateEdoImportPreflight,
} from "../hooks";
import type { EdoImportJobDto } from "../types";
import {
  formatImportNumber,
  getImportErrorMessage,
  importStatusTag,
  isActiveImportJob,
  isPreflightReady,
  isScanning,
  safeErrorLabel,
} from "./presentation";

interface EdoImportDiscoveryPanelProps {
  job?: EdoImportJobDto;
  jobLoading: boolean;
  jobError?: unknown;
  onJobCreated: (job: EdoImportJobDto) => void;
  onRefresh: () => void;
  onOpenAuthentication: () => void;
}

export default function EdoImportDiscoveryPanel({
  job,
  jobLoading,
  jobError,
  onJobCreated,
  onRefresh,
  onOpenAuthentication,
}: EdoImportDiscoveryPanelProps) {
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    dayjs().startOf("month"),
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());
  const preflight = useCreateEdoImportPreflight();
  const cancelJob = useCancelEdoImportJob(job?.id ?? 0);
  const activeJobLocked = Boolean(job && isActiveImportJob(job.status));

  const startPreflight = async () => {
    if (activeJobLocked) {
      toast.error(
        `Avval #${job?.id} jobni bekor qiling. Status: ${job?.status}.`,
      );
      return;
    }
    if (!dateTo) {
      toast.error("Tugash sanasini tanlang.");
      return;
    }
    if (dateFrom && dateFrom.isAfter(dateTo, "day")) {
      toast.error("Boshlanish sanasi tugash sanasidan katta bo‘lishi mumkin emas.");
      return;
    }
    try {
      const created = await preflight.mutateAsync({
        dateFrom: dateFrom?.format("YYYY-MM-DD") ?? null,
        dateTo: dateTo.format("YYYY-MM-DD"),
      });
      onJobCreated(created);
      toast.success(`Import qidiruvi yaratildi · #${created.id}`);
    } catch (error) {
      const existingJobId = getExistingJobId(error);
      if (existingJobId) {
        try {
          const existingJob = await edoImportService.job(existingJobId);
          onJobCreated(existingJob);
          toast.success(`Faol import job #${existingJob.id} topildi.`);
          return;
        } catch {
          // Fall through to the original API error when the conflict payload
          // contains an expired or inaccessible job ID.
        }
      }
      toast.error(getImportErrorMessage(error));
    }
  };

  const confirmCancel = () => {
    Modal.confirm({
      title: "Import qidiruvini to‘xtatish",
      content: "Joriy scan yakunlanmasdan bekor qilinadi.",
      okText: "To‘xtatish",
      okButtonProps: { danger: true },
      cancelText: "Davom ettirish",
      onOk: async () => {
        try {
          const cancelled = await cancelJob.mutateAsync();
          onJobCreated(cancelled);
          toast.success("Bekor qilish so‘rovi yuborildi.");
        } catch (error) {
          toast.error(getImportErrorMessage(error));
        }
      },
    });
  };

  const discovered = job?.discoveredCount ?? 0;
  const processed =
    (job?.readyCount ?? 0) +
    (job?.mappingRequiredCount ?? 0) +
    (job?.duplicateCount ?? 0) +
    (job?.skippedCount ?? 0);
  const progress = discovered > 0 ? Math.min(100, (processed / discovered) * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)]">
      {/* ── Chap ustun: sana tanlov + (agar tayyor bo'lsa) yakunlandi card ── */}
      <div className="flex flex-col gap-4">
        <Card className="border border-border p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <CalendarRange className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-heading">Qidiruv davri</h2>
              <p className="mt-1 text-sm text-secondary-text">
                DIDOX va EDOCS xarid hujjatlari shu oraliqda tekshiriladi.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-heading">
              <span>Boshlanish sanasi</span>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                format="DD.MM.YYYY"
                className="w-full"
                placeholder="Ixtiyoriy"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-heading">
              <span>Tugash sanasi</span>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                format="DD.MM.YYYY"
                className="w-full"
                placeholder="Majburiy"
              />
            </label>
          </div>

          <Button
            type="primary"
            icon={<Play className="size-4" />}
            loading={preflight.isPending}
            disabled={activeJobLocked}
            onClick={() => void startPreflight()}
            className="mt-5 w-full"
          >
            Preflight boshlash
          </Button>
          {activeJobLocked && job && (
            <Alert
              className="mt-4"
              type="warning"
              showIcon
              message={`#${job.id} job hali faol`}
              description="Yangi preflight boshlashdan oldin o‘ng tomondagi To‘xtatish tugmasini bosing va status CANCELLED bo‘lishini kuting."
            />
          )}
        </Card>

        {/* ── PREFLIGHT_READY: alohida yashil yakunlandi card ── */}
        {job && isPreflightReady(job.status) && (
          <Card className="border border-success/30 bg-success/5 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-success">Tekshiruv yakunlandi</h2>
                <p className="mt-1 text-sm text-secondary-text">
                  Tanlangan davr uchun barcha provayderlar yuzasidan preflight tekshiruvi
                  muvaffaqiyatli yakunlandi.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="border border-border p-5">
        {jobLoading && !job ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : jobError ? (
          <Alert type="error" showIcon message={getImportErrorMessage(jobError)} />
        ) : !job ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-surface-muted/25 p-8 text-center">
            <div>
              <ScanSearchArtwork />
              <h2 className="mt-4 font-semibold text-heading">Hali import job yo‘q</h2>
              <p className="mt-1 max-w-md text-sm text-secondary-text">
                Sana oralig‘ini tanlab preflight boshlang. Topilgan hujjatlar keyingi bosqichlarda mapping va Draft importga tayyorlanadi.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Job sarlavha + tugmalar ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-text">
                    Import job #{job.id}
                  </span>
                  {importStatusTag(job.status)}
                  {isScanning(job.status) && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-secondary-text">
                      <Spin size="small" />
                      Yuklanayotgan…
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-heading">
                  {dayjs(job.dateFrom).format("DD.MM.YYYY")} — {dayjs(job.dateTo).format("DD.MM.YYYY")}
                </h2>
              </div>
              <div className="flex gap-2">
                <Button
                  icon={<RefreshCw className="size-4" />}
                  loading={jobLoading}
                  onClick={onRefresh}
                >
                  Yangilash
                </Button>
                {isActiveImportJob(job.status) && (
                  <Button
                    danger
                    icon={<PauseCircle className="size-4" />}
                    loading={cancelJob.isPending}
                    onClick={confirmCancel}
                  >
                    To'xtatish
                  </Button>
                )}
              </div>
            </div>

            {/* ── Progress bar ── */}
            <Progress
              percent={isPreflightReady(job.status) ? 100 : Math.round(progress)}
              status={
                job.status === "FAILED"
                  ? "exception"
                  : isPreflightReady(job.status)
                  ? "success"
                  : "active"
              }
            />

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ["Topildi", job.discoveredCount],
                ["Tayyor", job.readyCount],
                ["Mapping", job.mappingRequiredCount],
                ["Duplicate", job.duplicateCount],
                ["O'tkazildi", job.skippedCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-surface-muted/55 p-3">
                  <div className="text-xl font-semibold tabular-nums text-heading">
                    {formatImportNumber(Number(value))}
                  </div>
                  <div className="mt-1 text-xs text-secondary-text">{label}</div>
                </div>
              ))}
            </div>

            {/* ── PREFLIGHT_READY: yakunlandi banner — faqat o'ng panelda yashirin ── */}

            {/* ── Job darajasidagi safeErrorCode ── */}
            {job.safeErrorCode && (
              <SafeErrorAlert code={job.safeErrorCode} />
            )}

            {/* ── Provider kartalar ── */}
            <div className="grid gap-3 md:grid-cols-2">
              {job.providers.map((provider) => {
                const scanning = isScanning(provider.status);
                const ready = isPreflightReady(provider.status) ||
                  (!scanning && provider.status !== "FAILED");
                const percent = provider.providerTotal
                  ? Math.min(100, (provider.scannedCount / provider.providerTotal) * 100)
                  : undefined;
                // PREFLIGHT_READY yoki tugagan holatda 100% ko'rsatamiz,
                // skanerda hisoblangan percent ishlatamiz.
                const displayPercent = ready && !scanning ? (percent ?? 100) : percent;
                const progressStatus: "active" | "success" | "exception" | "normal" =
                  provider.status === "FAILED"
                    ? "exception"
                    : !scanning && ready
                    ? "success"
                    : "active";

                return (
                  <div
                    key={provider.providerCode}
                    className="rounded-xl border border-border p-4 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-heading">{provider.providerCode}</span>
                        {scanning && <Spin size="small" />}
                      </div>
                      {importStatusTag(provider.status)}
                    </div>

                    {/* Skanerlanganlar */}
                    <div className="mt-3 flex items-center justify-between text-xs text-secondary-text">
                      <span>{provider.scannedCount} ta tekshirildi</span>
                      <span>Sahifa {provider.currentPage}</span>
                    </div>

                    {/* Progress */}
                    <Progress
                      percent={displayPercent}
                      showInfo={displayPercent != null}
                      size="small"
                      status={progressStatus}
                      className="mb-0 mt-1"
                    />

                    {/* Auth kerak */}
                    {provider.isWaitingAuth && (
                      <Button type="link" className="mt-2 p-0" onClick={onOpenAuthentication}>
                        Providerga autentifikatsiya qilish
                      </Button>
                    )}

                    {/* Provider safeErrorCode */}
                    {provider.safeErrorCode && (
                      <div className="mt-3">
                        <SafeErrorAlert code={provider.safeErrorCode} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

const getExistingJobId = (error: unknown) => {
  if (!isAxiosError(error)) return 0;

  const data = error.response?.data as
    | {
        id?: unknown;
        jobId?: unknown;
        job?: { id?: unknown };
        activeJob?: { id?: unknown };
      }
    | undefined;
  const headerJobId = error.response?.headers?.["x-job-id"];
  const candidate =
    data?.jobId ?? data?.job?.id ?? data?.activeJob?.id ?? data?.id ?? headerJobId;
  const jobId = Number(candidate);

  return Number.isInteger(jobId) && jobId > 0 ? jobId : 0;
};

function ScanSearchArtwork() {
  return (
    <div aria-hidden className="mx-auto grid size-20 place-items-center rounded-2xl border border-brand/15 bg-brand-soft text-brand">
      <CalendarRange className="size-8" />
    </div>
  );
}

/**
 * Backend yuborgan safeErrorCode ni foydalanuvchiga info bloк sifatida ko'rsatadi.
 * Kodni clipboard ga nusxalash imkoni bor.
 */
function SafeErrorAlert({ code }: { code: string }) {
  const label = code.replaceAll("_", " ").toLowerCase();

  const handleCopy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      // toast chiqarish shart emas, icon o'zi yetarli
    });
  };

  return (
    <Alert
      type="info"
      showIcon
      className="text-xs"
      message={
        <span className="capitalize">{label}</span>
      }
      description={
        <div className="mt-1 flex items-center gap-2">
          <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-secondary-text">
            {code}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            title="Kodni nusxalash"
            className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-secondary-text transition-colors hover:text-brand"
          >
            <ClipboardCopy className="size-3" />
            Nusxa
          </button>
        </div>
      }
    />
  );
}
