import { Alert, Button, Descriptions, Skeleton } from "antd";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEdoDocumentStatus, useEdoRemoteOutboxStatus } from "../hooks";
import EdoStatusBadge from "./EdoStatusBadge";

export default function EdoDocumentStatusPanel({
  id,
  direction,
  providerDocumentId,
}: {
  id: string | number;
  direction: "INBOX" | "OUTBOX";
  providerDocumentId?: string | null;
}) {
  const { t } = useTranslation();
  const statusQuery = useEdoDocumentStatus(direction, id);
  const remoteStatusQuery = useEdoRemoteOutboxStatus(providerDocumentId, false);

  if (statusQuery.isLoading) return <Skeleton active paragraph={{ rows: 2 }} />;
  if (statusQuery.isError || !statusQuery.data) {
    return (
      <Alert
        type="error"
        showIcon
        message={t("settings.integrations.edo.errors.status")}
        action={
          <Button size="small" onClick={() => void statusQuery.refetch()}>
            {t("common.reload")}
          </Button>
        }
      />
    );
  }

  const status = remoteStatusQuery.data?.status ?? statusQuery.data;
  if (!status) return null;
  return (
    <div className="space-y-3">
      {status.isReconciliationRequired && (
        <Alert
          type="warning"
          showIcon
          message={t("settings.integrations.edo.status.reconciliation")}
        />
      )}
      <Descriptions
        size="small"
        bordered
        column={{ xs: 1, sm: 2, lg: 4 }}
        items={[
          {
            key: "status",
            label: t("settings.integrations.edo.fields.status"),
            children: <EdoStatusBadge status={status} />,
          },
          {
            key: "localCode",
            label: t("settings.integrations.edo.fields.localStatus"),
            children: status.localCode || "—",
          },
          {
            key: "providerCode",
            label: t("settings.integrations.edo.fields.providerStatus"),
            children: status.providerStatusCode || "—",
          },
          {
            key: "checkedAt",
            label: t("settings.integrations.edo.fields.checkedAt"),
            children: status.checkedAt
              ? new Date(status.checkedAt).toLocaleString()
              : "—",
          },
        ]}
      />
      <div className="flex justify-end">
        <Button
          size="small"
          icon={<RefreshCw className="size-3.5" />}
          loading={statusQuery.isFetching}
          onClick={() => {
            void statusQuery.refetch();
            if (providerDocumentId) void remoteStatusQuery.refetch();
          }}
        >
          {t("common.refresh")}
        </Button>
      </div>
    </div>
  );
}
