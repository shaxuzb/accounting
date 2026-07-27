import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, ReceiptText, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { ProcessStatusBadge } from "@/components/ui/status";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import { saleEndpoints } from "../constants/endpoints";
import { salePermissions } from "../constants/permissions";
import { useGetListSale } from "../hooks";
import type { SaleDoc } from "../types/type";

const toPositiveInteger = (value: string | null, fallback: number) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
};

export default function SaleListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } = useGetListSale(searchParams);

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

  const tableColumns: TableColumnsType<SaleDoc> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      width: 70,
      align: "center",
    },
    {
      title: t("purchase.fields.docNumber"),
      dataIndex: "docNumber",
      minWidth: 150,
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: "Provodka",
      align: "center",
      width: 110,
      render: (_, record) => (
        <Link
          to={`/main/accountingentriesreport?documentTypeId=2&documentId=${record.id}`}
        >
          <Button icon={<ReceiptText className="size-4" />} />
        </Link>
      ),
    },
    {
      title: t("purchase.fields.docDate"),
      dataIndex: "docDate",
      align: "center",
      render: customDate,
    },
    {
      title: t("settings.fields.counterparty"),
      dataIndex: "counterpartyName",
      align: "center",
    },
    {
      title: t("purchase.fields.warehouse"),
      dataIndex: "warehouseName",
      align: "center",
    },
    {
      title: t("purchase.fields.amount"),
      dataIndex: "totalAmount",
      align: "right",
      render: (value, record) =>
        `${numberSpacing(value)} ${record.currencyCode ?? ""}`.trim(),
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "statusName",
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
    permissions.includes(salePermissions.update) ||
    permissions.includes(salePermissions.delete);
  const columns: TableColumnType<SaleDoc>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={saleEndpoints.saleDoc.list}
              customPath={`/main/sales/sale/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode: salePermissions.update,
                deleteCode: salePermissions.delete,
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
            onClick={() => void refetch()}
          />
          <PermissionCard permission={salePermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("common.add")}
              </Button>
            </Link>
          </PermissionCard>
        </Space>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<SaleDoc>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={tableData}
          rowKey="id"
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
