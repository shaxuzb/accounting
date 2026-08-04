import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import type { EdoDocumentStatusDto } from "../types/type";

const statusColors: Record<string, string> = {
  UNKNOWN: "default",
  DRAFT: "default",
  PENDING: "processing",
  SIGNED: "cyan",
  SENT: "blue",
  RECEIVED: "geekblue",
  REJECTED: "error",
  COMPLETED: "success",
  CANCELLED: "default",
  FAILED: "error",
  RECONCILIATION_REQUIRED: "warning",
};

export default function EdoStatusBadge({
  status,
}: {
  status: EdoDocumentStatusDto;
}) {
  const { t } = useTranslation();
  return (
    <Tag color={statusColors[status.code] ?? "default"}>
      {t(`settings.integrations.edo.statuses.${status.code}`, {
        defaultValue: status.code,
      })}
    </Tag>
  );
}
