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
import {
  Ban,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { numberSpacing } from "@/utils/utils";
import {
  useDownloadEdoFile,
  useEdoActiveProvider,
  useEdoAllDocuments,
  useEdoCapabilities,
  useEdoInbox,
  useEdoOutbox,
} from "../hooks";
import {
  getEdoNavigation,
  type EdoWorkspaceSection,
} from "../constants/navigation";
import type {
  EdoDocumentDto,
  EdoAllDocumentsQueryDto,
  EdoInboxQueryDto,
  EdoOutboxQueryDto,
} from "../types/type";
import {
  hasSupportedCapability,
  isCapabilityAvailable,
} from "../utils/capabilities";
import { saveDownloadedEdoFile } from "../utils/fileDownload";
import EdoRejectModal from "../components/EdoRejectModal";
import EdoStatusBadge from "../components/EdoStatusBadge";
import EdoInboxDocumentPreview from "../components/EdoInboxDocumentPreview";
import EdoSectionNavigation from "../components/EdoSectionNavigation";

export default function EdoInboxPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rejectDocument, setRejectDocument] = useState<EdoDocumentDto>();
  const [expandedDocumentId, setExpandedDocumentId] = useState<
    string | number
  >();
  const activeProviderQuery = useEdoActiveProvider();
  const provider = activeProviderQuery.data;
  const providerCode = provider?.code;
  const capabilitiesQuery = useEdoCapabilities(providerCode);
  const capabilities = capabilitiesQuery.data;
  const navigationItems = useMemo(
    () =>
      getEdoNavigation(providerCode).map((item) => {
        const capability =
          item.id === "INBOX"
            ? capabilities?.capabilities.canListInbox
            : item.id === "OUTBOX"
              ? capabilities?.capabilities.canListOutbox
              : item.id === "DRAFTS"
                ? capabilities?.capabilities.canListDrafts
                : item.id === "ALL"
                  ? capabilities?.capabilities.canListAll === "SUPPORTED" &&
                    capabilities.capabilities.canAggregateAll === "SUPPORTED"
                    ? "SUPPORTED"
                    : capabilities?.capabilities.canListAll ?? "UNKNOWN"
                  : "NOT_SUPPORTED";
        return {
          ...item,
          available:
            item.id === "TEMPLATES" || item.id === "EXCEL"
              ? false
              : isCapabilityAvailable(capability ?? "UNKNOWN"),
        };
      }),
    [capabilities, providerCode],
  );
  const requestedSection = searchParams.get("section") as EdoWorkspaceSection;
  const activeSection = navigationItems.some(
    (item) => item.id === requestedSection,
  )
    ? requestedSection
    : "INBOX";
  const activeNavigation = navigationItems.find(
    (item) => item.id === activeSection,
  );
  const isInbox = activeSection === "INBOX";
  const isOutbox = activeSection === "OUTBOX" || activeSection === "DRAFTS";
  const isAll = activeSection === "ALL";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const status = (searchParams.get("status") as EdoInboxQueryDto["status"]) || undefined;
  const category = (searchParams.get("category") as EdoInboxQueryDto["category"]) || undefined;
  const hasMarksValue = searchParams.get("hasMarks");
  const hasMarks = hasMarksValue == null ? undefined : hasMarksValue === "true";
  const fromDateFilterValue = searchParams.get("fromDate");
  const toDateFilterValue = searchParams.get("toDate");
  const fromDateFilter = fromDateFilterValue && dayjs(fromDateFilterValue).isValid()
    ? dayjs(fromDateFilterValue).format("YYYY-MM-DD")
    : undefined;
  const toDateFilter = toDateFilterValue && dayjs(toDateFilterValue).isValid()
    ? dayjs(toDateFilterValue).format("YYYY-MM-DD")
    : undefined;
  const inboxParams: EdoInboxQueryDto = {
    page,
    pageSize,
    search: searchParams.get("search") || undefined,
    hasMarks,
    category,
    status: isInbox ? status : undefined,
    fromDate: fromDateFilter,
    toDate: toDateFilter,
  };
  const outboxParams: EdoOutboxQueryDto = {
    page,
    pageSize,
    search: searchParams.get("search") || undefined,
    hasMarks,
    category: activeSection === "DRAFTS" ? "DRAFTS" : category,
    status,
    dateFrom: fromDateFilter,
    dateTo: toDateFilter,
  };
  const allParams: EdoAllDocumentsQueryDto = {
    ...outboxParams,
    category,
  };
  const canListInbox = hasSupportedCapability(provider, "ListInbox", capabilities);
  const canListOutbox = hasSupportedCapability(provider, "ListOutbox", capabilities);
  const canListAll = hasSupportedCapability(provider, "ListAll", capabilities) && hasSupportedCapability(provider, "AggregateAll", capabilities);
  const canList = isInbox ? canListInbox : isOutbox ? canListOutbox : isAll ? canListAll : false;
  const canReject = isInbox && hasSupportedCapability(provider, "RejectInbox", capabilities);
  const canDownload = hasSupportedCapability(provider, "GetFile", capabilities);
  const canGetDetail = hasSupportedCapability(provider, "GetDetail", capabilities);
  const inboxQuery = useEdoInbox(inboxParams, isInbox && canListInbox);
  const outboxQuery = useEdoOutbox(outboxParams, isOutbox && canListOutbox);
  const allDocumentsQuery = useEdoAllDocuments(allParams, isAll && canListAll);
  const activeQuery = isInbox ? inboxQuery : isOutbox ? outboxQuery : allDocumentsQuery;
  const downloadMutation = useDownloadEdoFile();
  const params = isInbox ? inboxParams : isOutbox ? outboxParams : allParams;
  const fromDate = fromDateFilterValue && dayjs(fromDateFilterValue).isValid()
    ? dayjs(fromDateFilterValue)
    : null;
  const toDate = toDateFilterValue && dayjs(toDateFilterValue).isValid()
    ? dayjs(toDateFilterValue)
    : null;
  const [searchInput, setSearchInput] = useState(params.search ?? "");
  const debouncedSearch = useDebounce(searchInput.trim(), 300);

  const updateParams = useCallback(
    (values: Record<string, string | number | boolean | undefined>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (debouncedSearch !== (params.search ?? "")) {
      updateParams({ search: debouncedSearch || undefined, page: 1 });
    }
  }, [debouncedSearch, params.search, updateParams]);

  const handleSectionChange = useCallback(
    (section: EdoWorkspaceSection) => {
      updateParams({ section, status: undefined, category: undefined, page: 1 });
      setExpandedDocumentId(undefined);
    },
    [updateParams],
  );

  const download = useCallback(async (document: EdoDocumentDto) => {
    try {
      const file = await downloadMutation.mutateAsync(document.id);
      saveDownloadedEdoFile(file);
      toast.success(t("settings.integrations.edo.messages.downloaded"));
    } catch (error) {
      errorHandlers(error);
    }
  }, [downloadMutation, t]);

  const statusOptions = (capabilities?.statusCapabilities ?? [])
    .filter((item) => isCapabilityAvailable(item.capability))
    .map((item) => ({
      value: item.status,
      label: t(`settings.integrations.edo.statuses.${item.status}`, {
        defaultValue: item.status,
      }),
    }));
  const categoryOptions = (capabilities?.categoryCapabilities ?? [])
    .filter((item) => isCapabilityAvailable(item.capability))
    .map((item) => ({ value: item.category, label: item.category }));
  const showFilterBar = isInbox || isOutbox || isAll;

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
          {activeNavigation
            ? t(activeNavigation.labelKey)
            : t("settings.integrations.edo.inbox.title")}
        </h1>
        <p className="mt-1 text-sm text-secondary-text">
          {canList
            ? t("settings.integrations.edo.inbox.description")
            : t("settings.integrations.edo.navigation.notAvailable")}
        </p>
      </div>

      {navigationItems.length > 0 && (
        <EdoSectionNavigation
          items={navigationItems}
          activeSection={activeSection}
          onSelect={handleSectionChange}
        />
      )}

      {!canList && !activeProviderQuery.isLoading && !capabilitiesQuery.isLoading && (
        <Alert
          type="warning"
          showIcon
          message={t("settings.integrations.edo.capabilityUnavailable")}
        />
      )}
      {activeQuery.isError && (
        <Alert
          type="error"
          showIcon
          message={t("settings.integrations.edo.errors.inboxLoad")}
          description={
            activeQuery.error instanceof Error
              ? activeQuery.error.message
              : undefined
          }
        />
      )}

      {showFilterBar && (
        <Card className="border border-border p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          <Input
            disabled={!canList}
            prefix={<Search className="size-4 text-secondary-text" />}
            value={searchInput}
            placeholder={t("common.search")}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Select
            allowClear
            disabled={!canList}
            value={params.status}
            placeholder={t("settings.integrations.edo.fields.status")}
            onChange={(value) => updateParams({ status: value, page: 1 })}
            options={statusOptions}
          />
          <Select
            allowClear
            disabled={!canList}
            value={params.category}
            placeholder={t("settings.integrations.edo.fields.category")}
            onChange={(value) => updateParams({ category: value, page: 1 })}
            options={categoryOptions}
          />
          <Select
            allowClear
            disabled={!canList}
            value={params.hasMarks}
            placeholder={t("settings.integrations.edo.fields.hasMarks")}
            onChange={(value) => updateParams({ hasMarks: value, page: 1 })}
            options={[{ value: true, label: t("settings.integrations.edo.fields.yes") }, { value: false, label: t("settings.integrations.edo.fields.no") }]}
          />
          <DatePicker
            disabled={!canList}
            className="w-full"
            value={fromDate}
            disabledDate={(current) => Boolean(toDate && current.isAfter(toDate, "day"))}
            placeholder={t("settings.integrations.edo.fields.fromDate")}
            onChange={(value) => updateParams({ fromDate: value?.format("YYYY-MM-DD"), page: 1 })}
          />
          <DatePicker
            disabled={!canList}
            className="w-full"
            value={toDate}
            disabledDate={(current) => Boolean(fromDate && current.isBefore(fromDate, "day"))}
            placeholder={t("settings.integrations.edo.fields.toDate")}
            onChange={(value) => updateParams({ toDate: value?.format("YYYY-MM-DD"), page: 1 })}
          />
          <Button
            icon={<RefreshCw className="size-4" />}
            loading={activeQuery.isFetching}
            disabled={!canList}
            onClick={() => void activeQuery.refetch()}
          >
            {t("common.refresh")}
          </Button>
          </div>
        </Card>
      )}

      {canList ? (
        <Card className="border border-border p-3">
          <Table
          rowKey="id"
          columns={columns}
          dataSource={activeQuery.data?.items ?? []}
          loading={activeQuery.isLoading || activeQuery.isFetching}
          scroll={{ x: 1150 }}
          expandable={{
            expandedRowKeys:
              expandedDocumentId == null ? [] : [expandedDocumentId],
            onExpand: (expanded, record) =>
              setExpandedDocumentId(expanded ? record.id : undefined),
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                type="text"
                size="small"
                aria-label={expanded ? "Collapse document" : "Expand document"}
                icon={
                  expanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onExpand(record, event);
                }}
              />
            ),
            expandedRowRender: (record) => (
              <EdoInboxDocumentPreview
                document={record}
                canDownload={canDownload}
                canReject={canReject}
                canGetDetail={canGetDetail}
                direction={record.direction}
                onDownload={(selectedDocument) =>
                  void download(selectedDocument)
                }
                onReject={() => setRejectDocument(record)}
              />
            ),
          }}
            pagination={{
            current: activeQuery.data?.page ?? params.page,
            pageSize: activeQuery.data?.pageSize ?? params.pageSize,
            total: activeQuery.data?.totalCount ?? undefined,
            showSizeChanger: true,
            onChange: (page, pageSize) => updateParams({ page, pageSize }),
          }}
          />
        </Card>
      ) : (
        <Card className="border border-border p-8">
          <Alert
            type="info"
            showIcon
            message={t("settings.integrations.edo.capabilityUnavailable")}
            description={t(
              "settings.integrations.edo.navigation.sectionUnavailable",
            )}
          />
        </Card>
      )}

      {rejectDocument && provider && (
        <EdoRejectModal
          open
          document={rejectDocument}
          onClose={() => setRejectDocument(undefined)}
          onRejected={() => void activeQuery.refetch()}
        />
      )}
    </div>
  );
}
