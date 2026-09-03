export type SourceStatusTone = "success" | "warning" | "danger";

export interface SourceStatusMeta {
  label: string;
  tone: SourceStatusTone;
}

export function getSourceStatusMeta(status: string): SourceStatusMeta {
  if (status === "AVAILABLE")
    return { label: "Ma'lumotlar tayyor", tone: "success" };
  if (status === "PARTIAL")
    return { label: "Qisman ma'lumot", tone: "warning" };
  return { label: "Manba mavjud emas", tone: "danger" };
}

export function isUnavailableAmount(value: number | null | undefined) {
  return value === null || value === undefined;
}

export function formatDashboardAmount(value: number, currencyCode = "UZS") {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  })
    .format(value)
    .replaceAll(",", " ");

  if (!currencyCode) return formatted;

  return currencyCode === "UZS"
    ? `${formatted} so‘m`
    : `${formatted} ${currencyCode}`;
}

export function formatDashboardCount(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value);
}

const dashboardDocumentLabels: Record<string, string> = {
  CONTRACT: "Shartnomalar",
  POWER_OF_ATTORNEY: "Ishonchnoma",
  FACTURA: "Hisob-fakturalar",
  WAYBILL: "TTYu",
  WAYBILL_LOCAL: "TTYu",
  TTYU: "TTYu",
};

const dashboardDocumentStatusLabels: Record<string, string> = {
  SIGNED: "Tasdiqlandi",
  SENT: "Jarayonda",
  REJECTED: "Rad etilgan",
  CANCELLED: "Bekor qilindi",
  CANCELED: "Bekor qilindi",
};

export function getDashboardDocumentLabel(code: string) {
  const normalizedCode = code.trim().toUpperCase();
  return dashboardDocumentLabels[normalizedCode] ?? (code || "—");
}

export function getDashboardDocumentStatusLabel(status: string) {
  const normalizedStatus = status.trim().toUpperCase();
  return dashboardDocumentStatusLabels[normalizedStatus] ?? (status || "—");
}
