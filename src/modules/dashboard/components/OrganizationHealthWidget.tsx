import { useState } from "react";
import { Button, Progress, Tag } from "antd";
import {
  AlertTriangle,
  BadgePercent,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  FileCheck2,
  HeartPulse,
  Receipt,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import DashboardSection from "./DashboardSection";

type Area = "TAX" | "VAT" | "EDO" | "ACCOUNTING" | "DATA" | "POLICY";
type Severity = "INFO" | "WARNING" | "ERROR";

interface HealthFinding {
  id: number;
  ruleCode: string;
  category: Area;
  severity: Severity;
  title: string;
  body: string | null;
  link: string | null;
  amount: number | null;
  firstFoundAt: string;
  lastFoundAt: string;
}

interface HealthResult {
  checkedAt: string;
  created: number;
  resolved: number;
  findings: HealthFinding[];
}

interface Overview {
  checkedAt: string | null;
  taxRegimeName: string | null;
  vatPayer: boolean;
  threshold: { income: number; threshold: number; share: number } | null;
  areas: Array<{ code: Area; status: "OK" | Severity; count: number }>;
  /** The last comparison of the invoices at the EDO operator with the books, this month and the last. */
  esf: Array<{
    checkedAt: string;
    provider: string;
    year: number;
    month: number;
    purchasesEsfVat: number;
    purchasesBooksVat: number;
    salesEsfVat: number;
    salesBooksVat: number;
  }>;
}

const severityStyle: Record<Severity, { border: string; tag: string }> = {
  ERROR: { border: "border-l-rose-500", tag: "red" },
  WARNING: { border: "border-l-amber-500", tag: "orange" },
  INFO: { border: "border-l-blue-400", tag: "blue" },
};

const tileStyle: Record<"OK" | Severity, string> = {
  OK: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  INFO: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  WARNING: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  ERROR: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
};

const areaIcon: Record<Area, typeof Receipt> = {
  TAX: BadgePercent,
  VAT: Receipt,
  EDO: FileCheck2,
  ACCOUNTING: BookOpenCheck,
  DATA: Database,
  POLICY: ScrollText,
};

const statusIcon = (status: "OK" | Severity) =>
  status === "OK" ? CheckCircle2 : status === "ERROR" ? CircleAlert : AlertTriangle;

const money = (value: number) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);

/**
 * The organization at a glance, as the daily check sees it: its tax regime (and, for a turnover tax
 * payer, how near the VAT threshold its income is), each area green / amber / red, and what is wrong
 * in the area picked — the gravest first, each opening where to fix it.
 */
export default function OrganizationHealthWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const organizationId = useAppSelector((state) => state.organization.id);
  const [area, setArea] = useState<Area | null>(null);
  const key = ["organization-health", organizationId];
  const overviewKey = ["organization-health", "overview", organizationId];

  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => (await $axiosPrivate.get<HealthResult>("/organization-health")).data,
    enabled: Boolean(organizationId),
  });
  const { data: overview } = useQuery({
    queryKey: overviewKey,
    queryFn: async () => (await $axiosPrivate.get<Overview>("/organization-health/overview")).data,
    enabled: Boolean(organizationId),
  });

  const run = useMutation({
    mutationFn: async () => (await $axiosPrivate.post<HealthResult>("/organization-health/run")).data,
    onSuccess: (result) => {
      queryClient.setQueryData(key, result);
      void queryClient.invalidateQueries({ queryKey: overviewKey });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(t("dashboard.health.checked", { created: result.created, resolved: result.resolved }));
    },
    onError: errorHandlers,
  });

  const findings = (data?.findings ?? []).filter((x) => !area || x.category === area);
  const all = data?.findings ?? [];
  const errors = all.filter((x) => x.severity === "ERROR").length;
  const warnings = all.filter((x) => x.severity === "WARNING").length;
  const checkedAt = data?.checkedAt && !data.checkedAt.startsWith("0001") ? data.checkedAt : null;
  const threshold = overview?.threshold;
  const sharePercent = threshold ? Math.min(100, Math.round(threshold.share * 100)) : 0;

  return (
    <DashboardSection
      title={t("dashboard.health.title")}
      description={
        checkedAt
          ? t("dashboard.health.checkedAt", { at: dayjs(checkedAt).format("DD.MM.YYYY HH:mm") })
          : t("dashboard.health.description")
      }
      icon={<HeartPulse className="size-5" />}
      extra={
        <div className="flex items-center gap-2">
          {errors > 0 && <Tag color="red">{t("dashboard.health.errors", { count: errors })}</Tag>}
          {warnings > 0 && <Tag color="orange">{t("dashboard.health.warnings", { count: warnings })}</Tag>}
          <Button size="small" icon={<RefreshCw className="size-4" />} loading={run.isPending} onClick={() => run.mutate()}>
            {t("dashboard.health.run")}
          </Button>
        </div>
      }
    >
      {overview && (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-(--theme-text-secondary)">{t("dashboard.health.regime")}:</span>
            <span className="font-medium text-heading">{overview.taxRegimeName ?? t("dashboard.health.regimeUnset")}</span>
            <Tag color={overview.vatPayer ? "purple" : "default"} className="m-0">
              {overview.vatPayer ? t("dashboard.health.vatPayer") : t("dashboard.health.notVatPayer")}
            </Tag>
          </div>
          {threshold && (
            <div className="rounded-lg border border-border bg-(--theme-bg-muted) px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-heading">{t("dashboard.health.threshold")}</span>
                <span className="text-(--theme-text-secondary)">
                  {money(threshold.income)} / {money(threshold.threshold)} {t("dashboard.health.soum")}
                </span>
              </div>
              <Progress
                percent={sharePercent}
                status={threshold.share >= 1 ? "exception" : "normal"}
                strokeColor={threshold.share >= 0.9 ? "#f43f5e" : threshold.share >= 0.7 ? "#f59e0b" : "#10b981"}
                showInfo
              />
              <div className="text-xs text-(--theme-text-secondary)">{t("dashboard.health.thresholdHint")}</div>
            </div>
          )}
          {overview.esf.length > 0 && (
            <div className="rounded-lg border border-border bg-(--theme-bg-muted) px-4 py-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-heading">{t("dashboard.health.esfTitle")}</span>
                <span className="text-xs text-(--theme-text-secondary)">
                  {overview.esf[0].provider} · {dayjs(overview.esf[0].checkedAt).format("DD.MM.YYYY HH:mm")}
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {overview.esf.map((item) => {
                  const month = `${item.year}-${String(item.month).padStart(2, "0")}`;
                  const purchaseGap = item.purchasesBooksVat - item.purchasesEsfVat;
                  const saleGap = item.salesBooksVat - item.salesEsfVat;
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => navigate(`/main/settings/integrations/edo/reconciliation?month=${month}`)}
                      className="rounded-md border border-border bg-(--theme-bg-card) px-3 py-2 text-left text-xs hover:border-(--theme-brand)"
                    >
                      <div className="mb-1 font-semibold text-heading">{dayjs(`${month}-01`).format("MM.YYYY")}</div>
                      <div className="flex justify-between gap-2">
                        <span>{t("dashboard.health.esfPurchases")}</span>
                        <span className={Math.abs(purchaseGap) >= 1 ? "font-semibold text-rose-600" : "text-emerald-600"}>
                          {money(item.purchasesEsfVat)} / {money(item.purchasesBooksVat)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>{t("dashboard.health.esfSales")}</span>
                        <span className={Math.abs(saleGap) >= 1 ? "font-semibold text-rose-600" : "text-emerald-600"}>
                          {money(item.salesEsfVat)} / {money(item.salesBooksVat)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
            {overview.areas.map((item) => {
              const Icon = areaIcon[item.code];
              const StatusIcon = statusIcon(item.status);
              const selected = area === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setArea(selected ? null : item.code)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${tileStyle[item.status]} ${
                    selected ? "ring-2 ring-(--theme-brand)" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate text-sm font-medium">{t(`dashboard.health.categories.${item.code}`)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                    {item.count > 0 && item.count}
                    <StatusIcon className="size-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {findings.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle2 className="size-5" />
          {checkedAt ? t("dashboard.health.allGood") : t("dashboard.health.notChecked")}
        </div>
      ) : (
        <div className="space-y-2">
          {findings.map((finding) => (
            <div
              key={finding.id}
              role={finding.link ? "button" : undefined}
              onClick={() => finding.link && navigate(finding.link)}
              className={`rounded-lg border border-border border-l-4 bg-(--theme-bg-muted) px-4 py-3 ${
                severityStyle[finding.severity].border
              } ${finding.link ? "cursor-pointer hover:bg-(--theme-bg-card)" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-heading">{finding.title}</div>
                  {finding.body && <p className="mt-1 text-sm text-(--theme-text-secondary)">{finding.body}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Tag color={severityStyle[finding.severity].tag} className="m-0">
                    {t(`dashboard.health.categories.${finding.category}`)}
                  </Tag>
                  {finding.link && <ChevronRight className="size-4 text-(--theme-text-secondary)" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
