import { Link, useSearchParams } from "react-router";
import { Alert, Button, Empty, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { FileUp, ReceiptText } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { formatDate, numberSpacing } from "@/utils/utils";
import type { PurchaseData } from "@/modules/purchase/pages/purchase/types/type";
import { purchasePermissions } from "@/modules/purchase/pages/purchase/constants/permissions";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useGetListPurchase } from "../hooks/useGetListPurchase";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import {
  purchaseAccountingEntriesReportDocumentTypeId,
  purchaseEndpoints,
} from "../constants/endpoints";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";

const purchaseStatusOptions = [
  { value: 1, label: "processStatuses.draft" },
  { value: 2, label: "processStatuses.posted" },
  { value: 3, label: "processStatuses.cancelled" },
  { value: 4, label: "processStatuses.pending" },
] as const;

const toPositiveInteger = (value: string | null, fallback: number) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
};

export default function PurchaseListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isError, isLoading, isFetching, refetch } =
    useGetListPurchase(searchParams);
  const currentPage = toPositiveInteger(
    searchParams.get("page"),
    data?.page ?? 1,
  );
  const pageSize = toPositiveInteger(
    searchParams.get("pageSize"),
    data?.pageSize ?? 20,
  );
  const tableData = (data?.items ?? []).map((item, index) => ({
    ...item,
    indexId: (currentPage - 1) * pageSize + index + 1,
  }));

  const handlePaginationChange = (page: number, nextPageSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPageSize === pageSize ? page : 1));
    nextParams.set("pageSize", String(nextPageSize));
    setSearchParams(nextParams, { replace: true });
  };

  const tableColumns: TableColumnsType<PurchaseData> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "externalDocNumber",
      title: t("purchase.fields.externalDocNumber"),
      render: (value) => value || "—",
    },
    {
      dataIndex: "accountingEntriesReport",
      title: t("common.accountingEntries"),
      align: "center",
      render: (_, record) => (
        <AccountingEntriesButton
          documentTypeId={purchaseAccountingEntriesReportDocumentTypeId}
          documentId={record.id}
          statusId={record.statusId}
          icon={<ReceiptText className="size-4" />}
        />
      ),
    },
    {
      dataIndex: "docDate",
      title: t("purchase.fields.docDate"),
      render: (value) => formatDate(value),
    },
    {
      dataIndex: "counterpartyName",
      title: t("purchase.fields.supplier"),
      align: "center",
    },
    {
      dataIndex: "warehouseName",
      title: t("purchase.fields.warehouse"),
      align: "center",
    },
    {
      dataIndex: "finalAmount",
      title: t("purchase.fields.amount"),
      align: "right",
      render: (_, record) => {
        const amount = record.finalAmount ?? record.totalAmount ?? 0;
        const currency = record.currencyCode || record.currencyName || "";

        return (
          <span className="whitespace-nowrap tabular-nums">
            {numberSpacing(amount, undefined, true)} {currency}
          </span>
        );
      },
    },
    {
      dataIndex: "statusName",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
    },
  ];

  const hasActions =
    userPermissions.includes(purchasePermissions.detail) ||
    userPermissions.includes(purchasePermissions.update) ||
    userPermissions.includes(purchasePermissions.delete);

  const columns: TableColumnType<PurchaseData>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 90,
          fixed: "right",
          render: (_, record) => (
            <div>
              <ActionColumn
                deletePath={purchaseEndpoints.purchase.list}
                customPath={
                  record.statusId === 1
                    ? `/main/purchases/purchase/edit/${record.id}`
                    : `/main/purchases/purchase/${record.id}`
                }
                record={record}
                permissions={user?.user.permissions}
                permissionsCode={{
                  editCode:
                    record.statusId === 1
                      ? purchasePermissions.update
                      : purchasePermissions.detail,
                  deleteCode: purchasePermissions.delete,
                }}
                refetch={refetch}
              />
            </div>
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="statusId"
              placeholder="settings.fields.status"
              options={purchaseStatusOptions}
              width={180}
            />
            <DateRangeFilter
              paramKeys={["startDate", "endDate"]}
              placeholderKeys={[
                "purchase.fields.dateFrom",
                "purchase.fields.dateTo",
              ]}
            />
          </>
        }
        actions={
          <PermissionCard permission={purchasePermissions.create}>
            <Link to="import">
              <Button type="primary" icon={<FileUp className="size-4" />}>
                {t("purchase.importTitle")}
              </Button>
            </Link>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        {isError && (
          <Alert
            showIcon
            type="error"
            className="m-3"
            message={t("purchase.messages.listLoadError")}
            action={
              <Button size="small" onClick={() => refetch()}>
                {t("purchase.actions.retry")}
              </Button>
            }
          />
        )}
        <Table
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("purchase.messages.listEmpty")}
              />
            ),
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} ta`,
            onChange: handlePaginationChange,
          }}
          scroll={{ x: "max-content", y: "calc(100vh - 280px)" }}
        />
      </Card>
    </div>
  );
}
