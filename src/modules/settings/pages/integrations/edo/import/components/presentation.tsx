import { isAxiosError } from "axios";
import { Tag } from "antd";
import type { ReactNode } from "react";
import type { EdoImportBulkStatus, EdoImportJobStatus } from "../types";
import i18n from "@/config/i18n";

const statusColors: Record<string, string> = {
  QUEUED: "blue",
  SCANNING: "processing",
  WAITING_AUTH: "warning",
  PREFLIGHT_READY: "cyan",
  IMPORTING: "processing",
  PARTIAL: "warning",
  COMPLETED: "success",
  FAILED: "error",
  CANCEL_REQUESTED: "orange",
  CANCELLED: "default",
  RUNNING: "processing",
  PAUSED: "warning",
  READY: "success",
  MAPPING_REQUIRED: "warning",
  DUPLICATE: "purple",
  IMPORTED: "success",
  SKIPPED: "default",
};

export const formatImportNumber = (value?: number | null) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(
        value,
      );

export const importStatusLabel = (status?: string | null): string => {
  if (!status) return "—";

  const fallback = status.replaceAll("_", " ");
  const translated = i18n.t(`settings.integrations.edo.import.statuses.${status}`, {
    defaultValue: fallback,
  }) as string;

  return translated || fallback;
};

export const importStatusTag = (status?: string | null): ReactNode => {
  if (!status) return "—";

  return (
    <Tag color={statusColors[status] ?? "default"} className="m-0 font-medium">
      {importStatusLabel(status)}
    </Tag>
  );
};

export const isActiveImportJob = (status?: EdoImportJobStatus) =>
  Boolean(
    status &&
    !new Set<EdoImportJobStatus>(["COMPLETED", "FAILED", "CANCELLED"]).has(
      status,
    ),
  );

export const isActiveBulkImport = (status?: EdoImportBulkStatus) =>
  Boolean(
    status &&
    new Set<EdoImportBulkStatus>(["QUEUED", "RUNNING", "CANCEL_REQUESTED"]).has(
      status,
    ),
  );

/** Job yoki provider hali skanerlanayotgan (loading) holatda */
export const isScanning = (status?: string | null) =>
  Boolean(status && new Set(["QUEUED", "SCANNING"]).has(status));

/** Preflight muvaffaqiyatli tugagan va import boshlashga tayyor */
export const isPreflightReady = (status?: string | null) =>
  status === "PREFLIGHT_READY";

/**
 * safeErrorCode ni o'qilishi mumkin bo'lgan matn sifatida qaytaradi.
 * Underscore → bo'shliq, kichik harfga o'tkazish.
 */
export const safeErrorLabel = (code?: string | null) =>
  code ? code.replaceAll("_", " ").toLowerCase() : null;

export const getImportErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "So'rovni bajarib bo'lmadi.";
  }

  const data = error.response?.data as
    | {
        safeErrorCode?: string;
        title?: string;
        correlationId?: string;
      }
    | undefined;
  const code = data?.safeErrorCode ?? data?.title;
  const correlation = data?.correlationId ? ` · ID: ${data.correlationId}` : "";

  if (error.response?.status === 409) {
    return `Reja yangilangan. Eng so'nggi ma'lumot qayta yuklandi${correlation}.`;
  }
  if (error.response?.status === 401) {
    return "EDO provider autentifikatsiyasi talab qilinadi.";
  }
  if (error.response?.status === 403) {
    return "Bu amal uchun ruxsat yetarli emas.";
  }
  if (error.response?.status === 404) {
    return "Import job yoki hujjat topilmadi.";
  }

  return `${code ? `Xato: ${code}` : "So'rovni bajarib bo'lmadi"}${correlation}.`;
};
