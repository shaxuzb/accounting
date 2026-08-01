import { Link, useSearchParams } from "react-router";
import { Alert, Button, Empty, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { FileUp, ReceiptText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { formatDate } from "@/utils/utils";
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
      dataIndex: "accountingEntriesReport",
      title: t("common.accountingEntries"),
      align: "center",
      render: (_, record) => (
        <Link
          to={`/main/accountingentriesreport?documentTypeId=${purchaseAccountingEntriesReportDocumentTypeId}&documentId=${record.id}`}
        >
          <Button icon={<ReceiptText className="size-4" />} />
        </Link>
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <PermissionCard permission={purchasePermissions.create}>
            <Link to="import">
              <Button type="primary" icon={<FileUp className="size-4" />}>
                {t("purchase.importTitle")}
              </Button>
            </Link>
          </PermissionCard>
          <Button
            icon={<RefreshCw className="size-4" />}
            loading={isFetching}
            onClick={() => void refetch()}
          />
        </Space>
      </div>
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
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
      </Card>
    </div>
  );
}
