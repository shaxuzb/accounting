import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/utils";

export type ProcessStatusCode = "draft" | "posted" | "cancelled" | "pending";

interface ProcessStatusBadgeProps {
  statusId?: number | null;
  statusCode?: string | null;
  statusName?: string | null;
  className?: string;
}

const STATUS_CODE_BY_ID: Record<number, ProcessStatusCode> = {
  1: "draft",
  2: "posted",
  3: "cancelled",
  4: "pending",
};

const STATUS_CLASSES: Record<ProcessStatusCode | "unknown", string> = {
  draft:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200",
  posted:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  unknown:
    "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
};

const DOT_CLASSES: Record<ProcessStatusCode | "unknown", string> = {
  draft: "bg-slate-500 dark:bg-slate-300",
  posted: "bg-emerald-500 dark:bg-emerald-300",
  cancelled: "bg-red-500 dark:bg-red-300",
  pending: "bg-amber-500 dark:bg-amber-300",
  unknown: "bg-gray-500 dark:bg-gray-300",
};

const normalizeCode = (
  statusCode?: string | null,
  statusId?: number | null,
  statusName?: string | null,
): ProcessStatusCode | "unknown" => {
  const normalizedCode = String(statusCode ?? "")
    .trim()
    .toLowerCase();
  if (["draft", "posted", "cancelled", "pending"].includes(normalizedCode)) {
    return normalizedCode as ProcessStatusCode;
  }

  if (statusId && STATUS_CODE_BY_ID[statusId]) {
    return STATUS_CODE_BY_ID[statusId];
  }

  const normalizedName = String(statusName ?? "")
    .trim()
    .toLowerCase();
  if (["qoralama", "draft"].includes(normalizedName)) return "draft";
  if (["o'tkazilgan", "otkazilgan", "posted"].includes(normalizedName)) {
    return "posted";
  }
  if (["bekor qilingan", "cancelled", "canceled"].includes(normalizedName)) {
    return "cancelled";
  }
  if (["kutilmoqda", "pending"].includes(normalizedName)) return "pending";

  return "unknown";
};

export default function ProcessStatusBadge({
  statusId,
  statusCode,
  statusName,
  className,
}: ProcessStatusBadgeProps) {
  const { t } = useTranslation();
  const code = useMemo(
    () => normalizeCode(statusCode, statusId, statusName),
    [statusCode, statusId, statusName],
  );
  const label =
    code === "unknown"
      ? statusName || "-"
      : t(`processStatuses.${code}`, { defaultValue: statusName || code });

  return (
    <span
      className={cn(
        "inline-flex min-w-25 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold leading-none",
        STATUS_CLASSES[code],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_CLASSES[code])} />
      {label}
    </span>
  );
}
