import { Link, useSearchParams } from "react-router";
import { Button, Space, Table, Tooltip } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, ReceiptText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import { warehouseTransferEndpoints } from "../constants/endpoints";
import { warehouseTransferPermissions } from "../constants/permissions";
import { useGetWarehouseTransfers } from "../hooks";
import type { WarehouseTransferDocument } from "../types/type";

export default function WarehouseTransferListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetWarehouseTransfers(searchParams);

  const tableColumns: TableColumnsType<WarehouseTransferDocument> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), align: "center" },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => <Link to={`${record.id}`}>{value ?? record.id}</Link>,
    },
    {
      dataIndex: "accountingEntriesReport",
      title: "Provodka",
      align: "center",
      render: (_, record) => (
        <Link to={`/main/accountingentriesreport?documentId=${record.id}`}>
          <Button icon={<ReceiptText className="size-4" />} />
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "sourceWarehouseName",
      title: "Manba ombor",
      render: (_, record) => record.sourceWarehouseName ?? record.sourceWarehouseId,
    },
    {
      dataIndex: "destinationWarehouseName",
      title: "Qabul ombor",
      render: (_, record) =>
        record.destinationWarehouseName ?? record.destinationWarehouseId,
    },
    {
      dataIndex: "comment",
      title: t("bank.fields.comment"),
      render: (value) => (
        <Tooltip title={value}>
          <span className="line-clamp-2">{value}</span>
        </Tooltip>
      ),
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

  const hasActions = permissions.includes(warehouseTransferPermissions.delete);
  const columns: TableColumnType<WarehouseTransferDocument>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={warehouseTransferEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode:
                  record.statusId === 1 ? warehouseTransferPermissions.delete : "",
                editCode:
                  record.statusId === 1 ? warehouseTransferPermissions.update : "",
              }}
              refetch={() => void refetch()}
              customPath={`/main/warehouses/transfers/${record.id}`}
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
          <PermissionCard permission={warehouseTransferPermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("common.add")}
              </Button>
            </Link>
          </PermissionCard>
          <Button icon={<RefreshCw className="size-4" />} onClick={() => void refetch()} />
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<WarehouseTransferDocument>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
      </Card>
    </div>
  );
}
