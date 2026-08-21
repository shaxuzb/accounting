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
import {
  Building2,
  CalendarRange,
  CheckCircle2,
  Copy,
  FileSearch,
  PauseCircle,
  Play,
  RefreshCw,
  SkipForward,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { getActiveEdoImportJobId } from "@/store/middleware/edoImportLogoutCleanup";
import { edoImportService } from "../api";
import { useCancelEdoImportJob, useCreateEdoImportPreflight } from "../hooks";
import type { EdoImportJobDto } from "../types";
import {
  formatImportNumber,
  getImportErrorMessage,
  importStatusTag,
  importStatusLabel,
  isActiveImportJob,
  isPreflightReady,
  isScanning,
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
        `Avval #${job?.id} jobni bekor qiling. Holat: ${importStatusLabel(
          job?.status,
        )}.`,
      );
      return;
    }
    if (!dateTo) {
      toast.error("Tugash sanasini tanlang.");
      return;
    }
    if (dateFrom && dateFrom.isAfter(dateTo, "day")) {
      toast.error(
        "Boshlanish sanasi tugash sanasidan katta bo‘lishi mumkin emas.",
      );
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
      const existingJobId =
        getExistingJobId(error) || getActiveEdoImportJobId();
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
  const progress =
    discovered > 0 ? Math.min(100, (processed / discovered) * 100) : 0;

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
            className="mt-5 mb-5 w-full"
          >
            Preflight boshlash
          </Button>
          {activeJobLocked && job && (
            <Alert
              className="mt-4"
              type="warning"
              showIcon
              description={`Yangi preflight boshlashdan oldin o‘ng tomondagi To‘xtatish tugmasini bosing va status ${importStatusLabel("CANCELLED")} bo‘lishini kuting.`}
            />
          )}
          {job && isPreflightReady(job.status) && (
            <Card className="border border-success/30 bg-success/5 p-5 mt-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                  <CheckCircle2 className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-success">
                    Tekshiruv yakunlandi
                  </h2>
                  <p className="mt-1 text-sm text-secondary-text">
                    Tanlangan davr uchun barcha provayderlar yuzasidan preflight
                    tekshiruvi muvaffaqiyatli yakunlandi.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </Card>

        {/* ── PREFLIGHT_READY: alohida yashil yakunlandi card ── */}
      </div>

      <Card className="border border-border p-5">
        {jobLoading && !job ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : jobError ? (
          <Alert
            type="error"
            showIcon
            message={getImportErrorMessage(jobError)}
          />
        ) : !job ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-border bg-surface-muted/25 p-8 text-center">
            <div>
              <ScanSearchArtwork />
              <h2 className="mt-4 font-semibold text-heading">
                Hali import job yo‘q
              </h2>
              <p className="mt-1 max-w-md text-sm text-secondary-text">
                Sana oralig‘ini tanlab preflight boshlang. Topilgan hujjatlar
                keyingi bosqichlarda moslashtirish bajarilib, qoralama importga
                tayyorlanadi.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Job sarlavha + tugmalar ── */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* <span className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-text">
                    Import job #{job.id}
                  </span> */}
                  {importStatusTag(job.status)}
                  {isScanning(job.status) && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-secondary-text">
                      <Spin size="small" />
                      Yuklanayotgan…
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-semibold text-heading">
                  {dayjs(job.dateFrom).format("DD.MM.YYYY")} —{" "}
                  {dayjs(job.dateTo).format("DD.MM.YYYY")}
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
              percent={
                isPreflightReady(job.status) ? 100 : Math.round(progress)
              }
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
                {
                  label: "Topildi",
                  value: job.discoveredCount,
                  icon: FileSearch,
                  iconClass: "bg-brand-soft text-brand",
                },
                {
                  label: "Tayyor",
                  value: job.readyCount,
                  icon: CheckCircle2,
                  iconClass: "bg-success/10 text-success",
                },
                {
                  label: "Moslashtirish kerak",
                  value: job.mappingRequiredCount,
                  icon: SlidersHorizontal,
                  iconClass: "bg-warning/10 text-warning",
                },
                {
                  label: "Takroriy",
                  value: job.duplicateCount,
                  icon: Copy,
                  iconClass: "bg-violet-500/10 text-violet-600",
                },
                {
                  label: "O‘tkazib yuborilgan",
                  value: job.skippedCount,
                  icon: SkipForward,
                  iconClass: "bg-surface-muted text-secondary-text",
                },
              ].map(({ label, value, icon: Icon, iconClass }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/70 bg-surface-muted/45 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xl font-semibold tabular-nums text-heading">
                      {formatImportNumber(Number(value))}
                    </div>
                    <span
                      aria-hidden
                      className={`grid size-7 shrink-0 place-items-center rounded-lg ${iconClass}`}
                    >
                      <Icon className="size-4" />
                    </span>
                  </div>
                  <div className="mt-1 text-xs leading-4 text-secondary-text">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── PREFLIGHT_READY: yakunlandi banner — faqat o'ng panelda yashirin ── */}

            {/* ── Job darajasidagi safeErrorCode ── */}
            {job.safeErrorCode && <SafeErrorAlert code={job.safeErrorCode} />}

            {/* ── Providerlar ro‘yxati ── */}
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/25 px-4 py-3">
                <div>
                  <h3 className="font-semibold text-heading">Providerlar</h3>
                  <p className="mt-0.5 text-xs text-secondary-text">
                    Har bir manbaning qidiruv natijasi va tekshiruv jarayoni
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-secondary-text">
                  <Building2 className="size-3.5" />
                  {job.providers.length} ta
                </span>
              </div>

              {job.providers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-secondary-text">
                  Provider natijasi hali mavjud emas.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {job.providers.map((provider) => {
                    const scanning = isScanning(provider.status);
                    const ready =
                      isPreflightReady(provider.status) ||
                      (!scanning && provider.status !== "FAILED");
                    const percent = provider.providerTotal
                      ? Math.min(
                          100,
                          (provider.scannedCount / provider.providerTotal) * 100,
                        )
                      : undefined;
                    // PREFLIGHT_READY yoki tugagan holatda 100% ko'rsatamiz,
                    // skanerda hisoblangan percent ishlatamiz.
                    const displayPercent =
                      ready && !scanning ? (percent ?? 100) : percent;
                    const progressStatus:
                      | "active"
                      | "success"
                      | "exception"
                      | "normal" =
                      provider.status === "FAILED"
                        ? "exception"
                        : !scanning && ready
                          ? "success"
                          : "active";

                    return (
                      <div
                        key={provider.providerCode}
                        className="p-4 transition-colors hover:bg-surface-muted/35 sm:p-5"
                      >
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)] lg:items-start">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
                                  <Building2 className="size-4" />
                                </span>
                                <div>
                                  <div className="font-semibold text-heading">
                                    {provider.providerCode}
                                  </div>
                                  <div className="text-xs text-secondary-text">
                                    {provider.scannedCount} ta tekshirildi
                                  </div>
                                </div>
                                {scanning && <Spin size="small" />}
                              </div>
                              {importStatusTag(provider.status)}
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-secondary-text">
                              <span>Qidiruv jarayoni</span>
                              <span>
                                Sahifa {formatImportNumber(provider.currentPage)}
                              </span>
                            </div>
                            <Progress
                              percent={displayPercent}
                              showInfo={displayPercent != null}
                              size="small"
                              status={progressStatus}
                              className="mb-0 mt-1"
                            />

                            {provider.isWaitingAuth && (
                              <Button
                                type="link"
                                className="mt-2 px-0"
                                onClick={onOpenAuthentication}
                              >
                                Providerga autentifikatsiya qilish
                              </Button>
                            )}

                            {provider.safeErrorCode && (
                              <div className="mt-3">
                                <SafeErrorAlert code={provider.safeErrorCode} />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-surface-muted/25 p-3 text-sm">
                            <ProviderMetric
                              label="Jami hujjatlar"
                              value={provider.providerTotal}
                            />
                            <ProviderMetric
                              label="Tekshirilgan"
                              value={provider.scannedCount}
                            />
                            <ProviderMetric
                              label="Sahifa hajmi"
                              value={provider.pageSize}
                            />
                            <ProviderMetric
                              label="Yakuniy sahifa"
                              value={provider.currentPage}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
    data?.jobId ??
    data?.job?.id ??
    data?.activeJob?.id ??
    data?.id ??
    headerJobId;
  const jobId = Number(candidate);

  return Number.isInteger(jobId) && jobId > 0 ? jobId : 0;
};

function ScanSearchArtwork() {
  return (
    <div
      aria-hidden
      className="mx-auto grid size-20 place-items-center rounded-2xl border border-brand/15 bg-brand-soft text-brand"
    >
      <CalendarRange className="size-8" />
    </div>
  );
}

function ProviderMetric({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="rounded-lg bg-primary-bg/70 px-2.5 py-2">
      <div className="text-[11px] leading-4 text-secondary-text">{label}</div>
      <div className="mt-1 font-semibold tabular-nums text-heading">
        {value == null ? "—" : formatImportNumber(value)}
      </div>
    </div>
  );
}

/**
 * Backend yuborgan safeErrorCode ni foydalanuvchiga info bloк sifatida ko'rsatadi.
 * Kodni clipboard ga nusxalash imkoni bor.
 */
function SafeErrorAlert({ code }: { code: string }) {
  const label = code.replaceAll("_", " ").toLowerCase();

  // const handleCopy = () => {
  //   void navigator.clipboard.writeText(code).then(() => {
  //     // toast chiqarish shart emas, icon o'zi yetarli
  //   });
  // };

  return (
    <Alert
      type="info"
      showIcon
      message={<span className="capitalize">{label}</span>}
      // description={
      //   <div className="mt-1 flex items-center gap-2">
      //     <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-secondary-text">
      //       {code}
      //     </code>
      //     <button
      //       type="button"
      //       onClick={handleCopy}
      //       title="Kodni nusxalash"
      //       className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-secondary-text transition-colors hover:text-brand"
      //     >
      //       <ClipboardCopy className="size-3" />
      //       Nusxa
      //     </button>
      //   </div>
      // }
    />
  );
}
