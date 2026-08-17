import { isAxiosError } from "axios";
import { Tag } from "antd";
import type { ReactNode } from "react";
import type { EdoImportBulkStatus, EdoImportJobStatus } from "../types";

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

export const importStatusTag = (status?: string | null): ReactNode =>
  status ? (
    <Tag color={statusColors[status] ?? "default"} className="m-0 font-medium">
      {status.replaceAll("_", " ")}
    </Tag>
  ) : (
    "—"
  );

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

export const getImportErrorMessage = (error: unknown) => {
  if (!isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "So‘rovni bajarib bo‘lmadi.";
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
    return `Reja yangilangan. Eng so‘nggi ma’lumot qayta yuklandi${correlation}.`;
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

  return `${code ? `Xato: ${code}` : "So‘rovni bajarib bo‘lmadi"}${correlation}.`;
};
