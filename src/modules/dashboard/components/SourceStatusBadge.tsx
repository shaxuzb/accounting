import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import type { SourceStatus } from "../types/type";
import { getSourceStatusMeta } from "../utils/dashboard";

export default function SourceStatusBadge({
  status,
}: {
  status: SourceStatus;
}) {
  const { t } = useTranslation();
  const meta = getSourceStatusMeta(status);
  const color =
    meta.tone === "success"
      ? "success"
      : meta.tone === "warning"
        ? "warning"
        : "error";

  return (
    <Tag color={color} className="m-0 rounded-full px-2.5 py-0.5 text-xs">
      {status === "AVAILABLE"
        ? t("dashboard.status.available")
        : status === "PARTIAL"
          ? t("dashboard.status.partial")
          : t("dashboard.status.unavailable")}
    </Tag>
  );
}
