import {
  Alert,
  Button,
  DatePicker,
  Input,
  Select,
  Skeleton,
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
import ListPagination from "@/components/ui/table/ListPagination";
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
  EdoDocumentCategory,
  EdoAllDocumentsQueryDto,
  EdoInboxQueryDto,
  EdoOutboxQueryDto,
} from "../types/type";
import {
  getCategoryCapabilityStatus,
  getSupportedStatusOptions,
  hasSupportedFilter,
  hasSupportedCapability,
  isCapabilityAvailable,
} from "../utils/capabilities";
import { saveDownloadedEdoFile } from "../utils/fileDownload";
import EdoRejectModal from "../components/EdoRejectModal";
import EdoStatusBadge from "../components/EdoStatusBadge";
import EdoInboxDocumentPreview from "../components/EdoInboxDocumentPreview";
import EdoSectionNavigation from "../components/EdoSectionNavigation";

const getDocumentRowKey = (document: EdoDocumentDto) =>
  document.id != null && document.id > 0
    ? document.id
    : document.documentIdentity ||
      document.providerDocumentId ||
      `${document.direction}-${document.documentNumber}-${document.documentDate}`;

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
  const capabilitiesLoading =
    activeProviderQuery.isLoading || capabilitiesQuery.isLoading;
  const navigationItems = useMemo(
    () =>
      getEdoNavigation()
        .map((item) => {
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
          const categoryCapability = getCategoryCapabilityStatus(
            capabilities,
            item.id,
          );

          return {
            ...item,
            available:
              isCapabilityAvailable(capability ?? "UNKNOWN") &&
              isCapabilityAvailable(categoryCapability),
          };
        })
        .filter((item) => item.available),
    [capabilities],
  );
  const requestedSection = searchParams.get("section") as EdoWorkspaceSection;
  const activeSection = navigationItems.some(
    (item) => item.id === requestedSection,
  )
    ? requestedSection
    : (navigationItems[0]?.id ?? "INBOX");
  const activeNavigation = navigationItems.find(
    (item) => item.id === activeSection,
  );
  const isInbox = activeSection === "INBOX";
  const isOutbox = activeSection === "OUTBOX";
  const isDrafts = activeSection === "DRAFTS";
  const isAll = activeSection === "ALL";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize")) || 20),
  );
  const status =
    (searchParams.get("status") as EdoInboxQueryDto["status"]) || undefined;
  const requestedCategory =
    (searchParams.get("category") as EdoDocumentCategory | null) ?? undefined;
  const supportedCategories = (capabilities?.categoryCapabilities ?? [])
    .filter(
      (item) =>
        item.category !== "ALL" && isCapabilityAvailable(item.capability),
    )
    .map((item) => item.category);
  const category =
    requestedCategory && supportedCategories.includes(requestedCategory)
      ? requestedCategory
      : undefined;
  const hasMarksValue = searchParams.get("hasMarks");
  const hasMarks =
    hasMarksValue === "true"
      ? true
      : hasMarksValue === "false"
        ? false
        : undefined;
  const dateFromFilterValue = searchParams.get("dateFrom");
  const dateToFilterValue = searchParams.get("dateTo");
  const dateFromFilter =
    dateFromFilterValue && dayjs(dateFromFilterValue).isValid()
      ? dayjs(dateFromFilterValue).format("YYYY-MM-DD")
      : undefined;
  const dateToFilter =
    dateToFilterValue && dayjs(dateToFilterValue).isValid()
      ? dayjs(dateToFilterValue).format("YYYY-MM-DD")
      : undefined;
  const searchValue = searchParams.get("search") ?? "";
  const debouncedSearch = useDebounce(searchValue.trim(), 300);
  const scopeDirection = activeNavigation?.direction;
  const scopeCategory: EdoDocumentCategory = isAll
    ? (category ?? "ALL")
    : activeSection;
  const canFilterSearch = hasSupportedFilter(
    capabilities,
    "Search",
    scopeDirection,
    scopeCategory,
  );
  const canFilterStatus = hasSupportedFilter(
    capabilities,
    "Status",
    scopeDirection,
    scopeCategory,
  );
  const canFilterHasMarks = hasSupportedFilter(
    capabilities,
    "HasMarks",
    scopeDirection,
    scopeCategory,
  );
  const canFilterDateFrom = hasSupportedFilter(
    capabilities,
    "DateFrom",
    scopeDirection,
    scopeCategory,
  );
  const canFilterDateTo = hasSupportedFilter(
    capabilities,
    "DateTo",
    scopeDirection,
    scopeCategory,
  );
  const canFilterCategory =
    isAll &&
    hasSupportedFilter(
      capabilities,
      "Category",
      undefined,
      "ALL",
    );
  const supportedStatusOptions = getSupportedStatusOptions(
    capabilities,
    scopeDirection,
    scopeCategory,
  );
  const selectedStatusOption = supportedStatusOptions.find(
    (option) => option.code === status,
  );
  const requestStatus =
    canFilterStatus && selectedStatusOption?.sendsProviderStatus
      ? selectedStatusOption.code
      : undefined;
  const commonParams = {
    page,
    pageSize,
    search: canFilterSearch ? debouncedSearch || undefined : undefined,
    hasMarks: canFilterHasMarks ? hasMarks : undefined,
    status: requestStatus,
    dateFrom: canFilterDateFrom ? dateFromFilter : undefined,
    dateTo: canFilterDateTo ? dateToFilter : undefined,
  };
  const inboxParams: EdoInboxQueryDto = {
    ...commonParams,
  };
  const outboxParams: EdoOutboxQueryDto = {
    ...commonParams,
  };
  const allParams: EdoAllDocumentsQueryDto = {
    ...commonParams,
    category: isDrafts ? "DRAFTS" : canFilterCategory ? category : undefined,
  };
  const canListInbox = hasSupportedCapability(
    provider,
    "ListInbox",
    capabilities,
  );
  const canListOutbox = hasSupportedCapability(
    provider,
    "ListOutbox",
    capabilities,
  );
  const canListAll =
    hasSupportedCapability(provider, "ListAll", capabilities) &&
    hasSupportedCapability(provider, "AggregateAll", capabilities);
  const canListDrafts = hasSupportedCapability(
    provider,
    "ListDrafts",
    capabilities,
  );
  const canList = isInbox
    ? canListInbox
    : isOutbox
      ? canListOutbox
      : isDrafts
        ? canListDrafts
        : isAll
          ? canListAll
          : false;
  const canReject = isInbox && hasSupportedCapability(provider, "RejectInbox", capabilities);
  const canDownload = hasSupportedCapability(provider, "GetFile", capabilities);
  const canGetDetail = hasSupportedCapability(provider, "GetDetail", capabilities);
  const inboxQuery = useEdoInbox(inboxParams, isInbox && canListInbox);
  const outboxQuery = useEdoOutbox(outboxParams, isOutbox && canListOutbox);
  const allDocumentsQuery = useEdoAllDocuments(
    allParams,
    (isDrafts && canListDrafts) || (isAll && canListAll),
  );
  const activeQuery = isInbox
    ? inboxQuery
    : isOutbox
      ? outboxQuery
      : allDocumentsQuery;
  const downloadMutation = useDownloadEdoFile();
  const params = isInbox ? inboxParams : isOutbox ? outboxParams : allParams;
  const dateFrom = dateFromFilterValue && dayjs(dateFromFilterValue).isValid()
    ? dayjs(dateFromFilterValue)
    : null;
  const dateTo = dateToFilterValue && dayjs(dateToFilterValue).isValid()
    ? dayjs(dateToFilterValue)
    : null;
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
    if (capabilitiesLoading || !capabilities) return;

    const next = new URLSearchParams(searchParams);
    let changed = false;
    const remove = (key: string) => {
      if (!next.has(key)) return;
      next.delete(key);
      changed = true;
    };

    if (!navigationItems.some((item) => item.id === requestedSection)) {
      if (next.get("section") !== activeSection) {
        next.set("section", activeSection);
        changed = true;
      }
    }
    if (!canFilterSearch) remove("search");
    if (!canFilterStatus || !selectedStatusOption) remove("status");
    if (!canFilterHasMarks) remove("hasMarks");
    if (!canFilterDateFrom) remove("dateFrom");
    if (!canFilterDateTo) remove("dateTo");
    if (!canFilterCategory || (requestedCategory && !category)) {
      remove("category");
    }
    remove("fromDate");
    remove("toDate");

    if (changed) setSearchParams(next, { replace: true });
  }, [
    activeSection,
    canFilterCategory,
    canFilterDateFrom,
    canFilterDateTo,
    canFilterHasMarks,
    canFilterSearch,
    canFilterStatus,
    capabilities,
    capabilitiesLoading,
    category,
    navigationItems,
    requestedCategory,
    requestedSection,
    searchParams,
    selectedStatusOption,
    setSearchParams,
  ]);

  const handleSectionChange = useCallback(
    (section: EdoWorkspaceSection) => {
      updateParams({
        section,
        status: undefined,
        category: undefined,
        search: undefined,
        hasMarks: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
      });
      setExpandedDocumentId(undefined);
    },
    [setExpandedDocumentId, updateParams],
  );

  const download = useCallback(async (document: EdoDocumentDto) => {
    if (document.id == null) return;
    try {
      const file = await downloadMutation.mutateAsync(document.id);
      saveDownloadedEdoFile(file);
      toast.success(t("settings.integrations.edo.messages.downloaded"));
    } catch (error) {
      errorHandlers(error);
    }
  }, [downloadMutation, t]);

  const statusOptions = supportedStatusOptions.map((item) => ({
    value: item.code,
    label: t(`settings.integrations.edo.statuses.${item.code}`, {
      defaultValue: item.code,
    }),
  }));
  const categoryOptions = supportedCategories.map((item) => ({
    value: item,
    label: item,
  }));
  const hasVisibleProviderFilter =
    canFilterSearch ||
    (canFilterStatus && statusOptions.length > 0) ||
    (canFilterCategory && categoryOptions.length > 0) ||
    canFilterHasMarks ||
    canFilterDateFrom ||
    canFilterDateTo;
  const showFilterBar = !capabilitiesLoading && canList;

  const columns = useMemo<TableColumnsType<EdoDocumentDto>>(
    () => [
      {
        title: t("settings.integrations.edo.fields.documentNumber"),
        dataIndex: "documentNumber",
        minWidth: 160,
        render: (value?: string | null) => value || "—",
      },
      {
        title: t("settings.integrations.edo.fields.documentDate"),
        dataIndex: "documentDate",
        width: 140,
        render: (value?: string | null) =>
          value ? dayjs(value).format("DD.MM.YYYY") : "—",
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
                disabled={!canDownload || record.id == null || downloadMutation.isPending}
                onClick={() => void download(record)}
              />
            </Tooltip>
            <Tooltip title={canReject ? t("settings.integrations.edo.actions.reject") : t("settings.integrations.edo.capabilityUnavailable")}>
              <Button
                type="text"
                danger
                icon={<Ban className="size-4" />}
                disabled={!canReject || record.id == null || record.status.isTerminal}
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

      {capabilitiesQuery.isError && (
        <Alert
          type="error"
          showIcon
          message={t("settings.integrations.edo.errors.capabilitiesLoad")}
          action={
            <Button size="small" onClick={() => void capabilitiesQuery.refetch()}>
              {t("common.reload")}
            </Button>
          }
        />
      )}
      {capabilitiesLoading && (
        <Card className="border border-border p-4">
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      )}
      {!canList && !capabilitiesLoading && !capabilitiesQuery.isError && (
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
          <div className="flex flex-wrap items-center gap-3">
            {!hasVisibleProviderFilter && (
              <div className="min-w-0 flex-1 text-sm text-secondary-text">
                {t(
                  providerCode === "EDOCS"
                    ? "settings.integrations.edo.inbox.filtersUnavailable"
                    : "settings.integrations.edo.capabilityUnavailable",
                )}
              </div>
            )}
            {canFilterSearch && (
              <Input
                prefix={<Search className="size-4 text-secondary-text" />}
                value={searchValue}
                placeholder={t("common.search")}
                onChange={(event) =>
                  updateParams({ search: event.target.value, page: 1 })
                }
                className="min-w-56 flex-1"
              />
            )}
            {canFilterStatus && statusOptions.length > 0 && (
              <Select
                allowClear
                value={selectedStatusOption?.code}
                placeholder={t("settings.integrations.edo.fields.status")}
                onChange={(value) => updateParams({ status: value, page: 1 })}
                options={statusOptions}
                className="min-w-52 flex-1"
              />
            )}
            {canFilterCategory && categoryOptions.length > 0 && (
              <Select
                allowClear
                value={category}
                placeholder={t("settings.integrations.edo.fields.category")}
                onChange={(value) =>
                  updateParams({ category: value, status: undefined, page: 1 })
                }
                options={categoryOptions}
                className="min-w-48 flex-1"
              />
            )}
            {canFilterHasMarks && (
              <Select
                allowClear
                value={hasMarks}
                placeholder={t("settings.integrations.edo.fields.hasMarks")}
                onChange={(value) =>
                  updateParams({ hasMarks: value, page: 1 })
                }
                options={[
                  {
                    value: true,
                    label: t("settings.integrations.edo.fields.yes"),
                  },
                  {
                    value: false,
                    label: t("settings.integrations.edo.fields.no"),
                  },
                ]}
                className="min-w-44 flex-1"
              />
            )}
            {canFilterDateFrom && (
              <DatePicker
                className="min-w-44 flex-1"
                value={dateFrom}
                disabledDate={(current) =>
                  Boolean(dateTo && current.isAfter(dateTo, "day"))
                }
                placeholder={t("settings.integrations.edo.fields.fromDate")}
                onChange={(value) =>
                  updateParams({
                    dateFrom: value?.format("YYYY-MM-DD"),
                    page: 1,
                  })
                }
              />
            )}
            {canFilterDateTo && (
              <DatePicker
                className="min-w-44 flex-1"
                value={dateTo}
                disabledDate={(current) =>
                  Boolean(dateFrom && current.isBefore(dateFrom, "day"))
                }
                placeholder={t("settings.integrations.edo.fields.toDate")}
                onChange={(value) =>
                  updateParams({
                    dateTo: value?.format("YYYY-MM-DD"),
                    page: 1,
                  })
                }
              />
            )}
            <Button
              icon={<RefreshCw className="size-4" />}
              loading={activeQuery.isFetching}
              onClick={() => void activeQuery.refetch()}
              className="ml-auto"
            >
              {t("common.refresh")}
            </Button>
          </div>
        </Card>
      )}

      {!capabilitiesLoading && canList ? (
        <Card className="border border-border p-3">
          <Table
          rowKey={getDocumentRowKey}
          columns={columns}
          dataSource={activeQuery.data?.items ?? []}
          loading={activeQuery.isLoading || activeQuery.isFetching}
          scroll={{ x: 1150 }}
          expandable={{
            rowExpandable: (record) =>
              canDownload && record.id != null && record.id > 0,
            expandedRowKeys:
              expandedDocumentId == null ? [] : [expandedDocumentId],
            onExpand: (expanded, record) =>
              setExpandedDocumentId(
                expanded ? getDocumentRowKey(record) : undefined,
              ),
            expandIcon: ({ expanded, expandable, onExpand, record }) =>
              expandable ? (
                <Button
                  type="text"
                  size="small"
                  aria-label={
                    expanded ? "Collapse document" : "Expand document"
                  }
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
              ) : null,
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
            pagination={false}
          />
          <ListPagination
            current={activeQuery.data?.page ?? params.page}
            pageSize={activeQuery.data?.pageSize ?? params.pageSize}
            total={activeQuery.data?.totalCount ?? 0}
            onChange={(page, pageSize) => updateParams({ page, pageSize })}
          />
        </Card>
      ) : !capabilitiesLoading && !capabilitiesQuery.isError ? (
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
      ) : null}

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
