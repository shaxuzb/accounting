import { Tag } from "antd";
import { useTranslation } from "react-i18next";
import type { IntegrationStatus } from "../types/type";

const statusColors: Record<IntegrationStatus, string> = {
  DISCONNECTED: "default",
  CONNECTING: "processing",
  CONNECTED: "success",
  ERROR: "error",
};

export default function IntegrationStatusBadge({
  status,
}: {
  status: IntegrationStatus;
}) {
  const { t } = useTranslation();
  return (
    <Tag color={statusColors[status]}>
      {t(`settings.integrations.status.${status.toLowerCase()}`)}
    </Tag>
  );
}
