import {
  Alert,
  Button,
  DatePicker,
  Input,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import type { TableColumnsType } from "antd";
import { Ban, Download, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import {
  useDownloadEdoFile,
  useEdoActiveProvider,
  useEdoInbox,
} from "../hooks";
import type {
  EdoDocumentDto,
  EdoInboxQueryDto,
} from "../types/type";
import { hasSupportedCapability } from "../utils/capabilities";
import { saveDownloadedEdoFile } from "../utils/fileDownload";
import EdoRejectModal from "../components/EdoRejectModal";
import EdoStatusBadge from "../components/EdoStatusBadge";
import EdoDocumentStatusPanel from "../components/EdoDocumentStatusPanel";

export default function EdoInboxPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rejectDocument, setRejectDocument] = useState<EdoDocumentDto>();
  const activeProviderQuery = useEdoActiveProvider();
  const provider = activeProviderQuery.data;
  const params: EdoInboxQueryDto = {
    companyInn: searchParams.get("companyInn") || undefined,
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    pageSize: Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20)),
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as EdoInboxQueryDto["status"]) || undefined,
    fromDate: searchParams.get("fromDate") || undefined,
    toDate: searchParams.get("toDate") || undefined,
  };
  const canList = hasSupportedCapability(provider, "ListInbox");
  const canReject = hasSupportedCapability(provider, "RejectInbox");
  const canDownload = hasSupportedCapability(provider, "GetFile");
  const inboxQuery = useEdoInbox(params, canList);
  const downloadMutation = useDownloadEdoFile();

  const updateParams = (values: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const download = useCallback(async (document: EdoDocumentDto) => {
    try {
      const file = await downloadMutation.mutateAsync(document.id);
      saveDownloadedEdoFile(file);
      toast.success(t("settings.integrations.edo.messages.downloaded"));
    } catch (error) {
      errorHandlers(error);
    }
  }, [downloadMutation, t]);

  const columns = useMemo<TableColumnsType<EdoDocumentDto>>(
    () => [
      {
        title: t("settings.integrations.edo.fields.documentNumber"),
        dataIndex: "documentNumber",
        minWidth: 160,
      },
      {
        title: t("settings.integrations.edo.fields.documentDate"),
        dataIndex: "documentDate",
        width: 140,
        render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
      },
      {
        title: t("settings.integrations.edo.fields.seller"),
        dataIndex: ["seller", "name"],
        minWidth: 220,
        render: (_: unknown, record) => record.seller?.name ?? "—",
      },
      {
        title: t("settings.integrations.edo.fields.buyer"),
        dataIndex: ["buyer", "name"],
        minWidth: 220,
        render: (_: unknown, record) => record.buyer?.name ?? "—",
      },
      {
        title: t("settings.integrations.edo.fields.amount"),
        dataIndex: "totalAmount",
        align: "right",
        width: 160,
        render: (value?: number, record?: EdoDocumentDto) =>
          value == null ? "—" : `${numberSpacing(value)} ${record?.currencyCode ?? ""}`,
      },
      {
        title: t("settings.integrations.edo.fields.status"),
        dataIndex: "status",
        width: 170,
        render: (_, record) => <EdoStatusBadge status={record.status} />,
      },
      {
        title: t("common.actions"),
        key: "actions",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Tooltip title={canDownload ? t("settings.integrations.edo.actions.download") : t("settings.integrations.edo.capabilityUnavailable")}>
              <Button
                type="text"
                icon={<Download className="size-4" />}
                disabled={!canDownload || downloadMutation.isPending}
                onClick={() => void download(record)}
              />
            </Tooltip>
            <Tooltip title={canReject ? t("settings.integrations.edo.actions.reject") : t("settings.integrations.edo.capabilityUnavailable")}>
              <Button
                type="text"
                danger
                icon={<Ban className="size-4" />}
                disabled={!canReject || record.status.isTerminal}
                onClick={() => setRejectDocument(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [canDownload, canReject, download, downloadMutation.isPending, t],
  );

  return (
    <div className="w-full space-y-2">
      <div className="px-1">
        <h1 className="text-2xl font-semibold text-heading">
          {t("settings.integrations.edo.inbox.title")}
        </h1>
        <p className="mt-1 text-sm text-secondary-text">
          {t("settings.integrations.edo.inbox.description")}
        </p>
      </div>

      {!canList && !activeProviderQuery.isLoading && (
        <Alert
          type="warning"
          showIcon
          message={t("settings.integrations.edo.inbox.unavailable")}
        />
      )}
      <Card className="border border-border p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Input
            value={params.companyInn}
            placeholder={t("settings.integrations.edo.fields.companyInn")}
            onChange={(event) => updateParams({ companyInn: event.target.value, page: 1 })}
          />
          <Input
            prefix={<Search className="size-4 text-secondary-text" />}
            value={params.search}
            placeholder={t("common.search")}
            onChange={(event) => updateParams({ search: event.target.value, page: 1 })}
          />
          <Select
            allowClear
            value={params.status}
            placeholder={t("settings.integrations.edo.fields.status")}
            onChange={(value) => updateParams({ status: value, page: 1 })}
            options={[
              "UNKNOWN", "DRAFT", "PENDING", "SIGNED", "SENT", "RECEIVED",
              "REJECTED", "COMPLETED", "CANCELLED", "FAILED",
              "RECONCILIATION_REQUIRED",
            ].map((value) => ({
              value,
              label: t(`settings.integrations.edo.statuses.${value}`),
            }))}
          />
          <DatePicker
            className="w-full"
            value={params.fromDate ? dayjs(params.fromDate) : null}
            placeholder={t("settings.integrations.edo.fields.fromDate")}
            onChange={(value) => updateParams({ fromDate: value?.format("YYYY-MM-DD"), page: 1 })}
          />
          <DatePicker
            className="w-full"
            value={params.toDate ? dayjs(params.toDate) : null}
            placeholder={t("settings.integrations.edo.fields.toDate")}
            onChange={(value) => updateParams({ toDate: value?.format("YYYY-MM-DD"), page: 1 })}
          />
          <Button
            icon={<RefreshCw className="size-4" />}
            loading={inboxQuery.isFetching}
            disabled={!canList}
            onClick={() => void inboxQuery.refetch()}
          >
            {t("common.refresh")}
          </Button>
        </div>
      </Card>

      <Card className="border border-border p-3">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={inboxQuery.data?.items ?? []}
          loading={inboxQuery.isLoading || inboxQuery.isFetching}
          scroll={{ x: 1150 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="p-3"><EdoDocumentStatusPanel id={record.id} direction="INBOX" /></div>
            ),
          }}
          pagination={{
            current: inboxQuery.data?.page ?? params.page,
            pageSize: inboxQuery.data?.pageSize ?? params.pageSize,
            total:
              inboxQuery.data?.totalCount ??
              params.page * params.pageSize + 1,
            showSizeChanger: true,
            onChange: (page, pageSize) => updateParams({ page, pageSize }),
          }}
        />
      </Card>

      {rejectDocument && provider && (
        <EdoRejectModal
          open
          document={rejectDocument}
          onClose={() => setRejectDocument(undefined)}
          onRejected={() => void inboxQuery.refetch()}
        />
      )}
    </div>
  );
}
