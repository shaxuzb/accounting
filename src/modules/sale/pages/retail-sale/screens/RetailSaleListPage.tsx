import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import { Alert, Button, Empty, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, ReceiptText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import {
  retailSaleAccountingEntriesReportDocumentTypeId,
  retailSaleEndpoints,
} from "../constants/endpoints";
import { retailSalePermissions } from "../constants/permissions";
import { useGetRetailSales } from "../hooks";
import type { RetailSaleDoc } from "../types/type";

const toPositiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default function RetailSaleListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isError, isLoading, isFetching, refetch } =
    useGetRetailSales(searchParams);
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

  const tableColumns: TableColumnsType<RetailSaleDoc> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      width: 70,
      align: "center",
    },
    {
      dataIndex: "docNumber",
      title: t("retailSale.fields.docNumber"),
      minWidth: 140,
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: t("common.accountingEntries"),
      align: "center",
      width: 110,
      render: (_, record) => (
        <AccountingEntriesButton
          documentTypeId={retailSaleAccountingEntriesReportDocumentTypeId}
          documentId={record.id}
          statusId={record.statusId}
          icon={<ReceiptText className="size-4" />}
        />
      ),
    },
    {
      dataIndex: "docDate",
      title: t("retailSale.fields.docDate"),
      align: "center",
      render: customDate,
    },
    {
      dataIndex: "counterpartyName",
      title: t("retailSale.fields.customer"),
      render: (value) => value || t("retailSale.fields.retailCustomer"),
    },
    {
      dataIndex: "warehouseName",
      title: t("retailSale.fields.warehouse"),
    },
    {
      dataIndex: "cashRegisterName",
      title: t("retailSale.fields.cashRegister"),
      render: (value, record) => value || record.cashRegisterId || "-",
    },
    {
      dataIndex: "finalAmount",
      title: t("retailSale.fields.totalAmount"),
      align: "center",
      render: (value, record) =>
        `${numberSpacing(Number(value ?? 0))} ${record.currencyCode || "UZS"}`,
    },
    {
      dataIndex: "statusName",
      title: t("retailSale.fields.status"),
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
    permissions.includes(retailSalePermissions.detail) ||
    permissions.includes(retailSalePermissions.update) ||
    permissions.includes(retailSalePermissions.delete);
  const columns: TableColumnType<RetailSaleDoc>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          width: 90,
          fixed: "right",
          align: "center",
          render: (_, record) => (
            <ActionColumn
              deletePath={retailSaleEndpoints.list}
              customPath={
                record.statusId === 1
                  ? `/main/sales/retail-sale/edit/${record.id}`
                  : `/main/sales/retail-sale/${record.id}`
              }
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode:
                  record.statusId === 1
                    ? retailSalePermissions.update
                    : retailSalePermissions.detail,
                deleteCode: retailSalePermissions.delete,
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            loading={isFetching}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={retailSalePermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("common.add")}
              </Button>
            </Link>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        {isError && (
          <Alert
            showIcon
            type="error"
            className="m-3"
            message={t("retailSale.messages.listLoadError")}
            action={
              <Button size="small" onClick={() => void refetch()}>
                {t("common.reload")}
              </Button>
            }
          />
        )}
        <Table<RetailSaleDoc>
          columns={columns}
          dataSource={tableData}
          loading={isLoading || isFetching}
          rowKey="id"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("retailSale.messages.listEmpty")}
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
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
