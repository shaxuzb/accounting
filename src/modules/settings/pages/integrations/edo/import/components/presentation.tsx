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
  RESOLVED: "success",
  MAPPED: "success",
  MAPPING_REQUIRED: "warning",
  PENDING_MAPPING: "warning",
  UNRESOLVED: "warning",
  NOT_MAPPED: "warning",
  DUPLICATE: "purple",
  IMPORTED: "success",
  SKIPPED: "default",
  PROCESSING: "processing",
  NEW: "blue",
  DRAFT: "default",
  INVALID: "error",
  REJECTED: "error",
};

const normalizeStatus = (status?: string | null) =>
  status?.trim().toUpperCase() ?? "";

const getStatusColor = (status: string) => {
  if (status.includes("DUPLICATE")) return "purple";
  if (
    /(FAILED|ERROR|INVALID|REJECTED|DENIED|BLOCKED)/.test(status)
  ) {
    return "error";
  }
  if (/(RESOLVED|MAPPED|IMPORTED|COMPLETED|SUCCESS|READY)/.test(status)) {
    return "success";
  }
  if (
    /(PENDING|WAITING|REQUIRED|UNRESOLVED|UNMAPPED|NOT_MAPPED|PARTIAL|PAUSED)/.test(
      status,
    )
  ) {
    return "warning";
  }
  if (/(RUNNING|SCANNING|IMPORTING|PROCESSING|QUEUED)/.test(status)) {
    return "processing";
  }
  return "default";
};

export const formatImportNumber = (value?: number | null) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(
        value,
      );

export const importStatusLabel = (status?: string | null): string => {
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) return "—";

  const fallback = normalizedStatus
    .replaceAll("_", " ")
    .toLocaleLowerCase("uz-UZ")
    .replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("uz-UZ"));
  const translated = i18n.t(
    `settings.integrations.edo.import.statuses.${normalizedStatus}`,
    { defaultValue: fallback },
  ) as string;

  return translated || fallback;
};

export const importStatusTag = (status?: string | null): ReactNode => {
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) return "—";

  return (
    <Tag
      color={statusColors[normalizedStatus] ?? getStatusColor(normalizedStatus)}
      className="m-0 font-medium"
    >
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
  code
    ? ({
        AUTHENTICATION_REQUIRED: "Provider autentifikatsiyasi kerak",
        MARKING_COUNT_MISMATCH: "Marking soni hujjat miqdoriga mos emas",
        DRAFT_IMPORT_MARKING_ALREADY_USED:
          "Marking boshqa Purchase’da ishlatilgan",
        DRAFT_IMPORT_LINE_INVALID: "Hujjat qatori tekshiruvdan o‘tmadi",
        STALE_MASTER_DATA_PLAN: "Asosiy ma’lumotlar rejasi eskirgan",
        STALE_PRODUCT_CONFLICT_PLAN: "Mahsulot konflikt rejasi eskirgan",
        STALE_MARKING_CONFLICT_PLAN: "Marking rejasi eskirgan",
        STALE_IMPORT_PLAN: "Import rejasi eskirgan",
        STALE_DRAFT_IMPORT_FAILURE_PLAN: "Xatolar ro‘yxati eskirgan",
        STALE_PIECE_TRACKING_PLAN: "Dona hisobi rejasi eskirgan",
      }[code.replaceAll(".", "_").toUpperCase()] ??
        code.replaceAll("_", " ").replaceAll(".", " ").toLowerCase())
    : null;

/**
 * Mapping is an action for candidates that can still become an importable
 * document. DUPLICATE/IMPORTED candidates are review-only, even if their
 * provider-side mappingStatus is PARTIAL.
 */
export const isCandidateMappingEditable = (
  status?: string | null,
  _mappingStatus?: string | null,
) => {
  const normalizedStatus = status?.trim().toUpperCase();

  return ["READY", "MAPPING_REQUIRED"].includes(normalizedStatus ?? "");
};

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
  const normalizedCode = code?.replaceAll(".", "_").toUpperCase();

  const knownMessages: Record<string, string> = {
    EDOIMPORT_ACTIVEJOBEXISTS:
      "Bu tashkilot uchun faol import job allaqachon mavjud. Uni davom ettiring yoki bekor qiling.",
    ACTIVE_JOB_EXISTS:
      "Bu tashkilot uchun faol import job allaqachon mavjud. Uni davom ettiring yoki bekor qiling.",
    STALE_MASTER_DATA_PLAN:
      "Asosiy ma’lumotlar rejasi yangilangan. Ma’lumotlarni qayta tekshiring.",
    STALE_PRODUCT_CONFLICT_PLAN:
      "Mahsulot konfliktlari yangilangan. Qarorlarni qayta ko‘rib chiqing.",
    STALE_MARKING_CONFLICT_PLAN:
      "Marking muammolari yangilangan. Qarorlarni qayta ko‘rib chiqing.",
    STALE_IMPORT_PLAN:
      "Import rejasi yangilangan. Importdan oldin ma’lumotlarni qayta tekshiring.",
    STALE_DRAFT_IMPORT_FAILURE_PLAN:
      "Xatolar ro‘yxati yangilangan. Qarorlarni qayta tanlang.",
    STALE_PIECE_TRACKING_PLAN:
      "Dona hisobi rejasi yangilangan. Qarorlarni qayta ko‘rib chiqing.",
    ACTIVE_BULK_IMPORT:
      "Bu job uchun fon importi allaqachon ishlayapti.",
  };

  if (normalizedCode && knownMessages[normalizedCode]) {
    return `${knownMessages[normalizedCode]}${correlation}`;
  }

  if (error.response?.status === 409) {
    return `Ma’lumotlar o‘zgargan. Eng so‘nggi ma’lumotlarni qayta yuklang${correlation}.`;
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

  if (error.response?.status === 422) {
    return `${safeErrorLabel(code) ?? "Bu amalni bajarib bo‘lmaydi"}${correlation}.`;
  }

  return `${code ? `Xato: ${safeErrorLabel(code)}` : "So‘rovni bajarib bo‘lmadi"}${correlation}.`;
};
