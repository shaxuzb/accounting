import { Link, useSearchParams } from "react-router";
import { Button, Space, Table, Tooltip } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import { inventoryCountEndpoints } from "../constants/endpoints";
import { inventoryCountPermissions } from "../constants/permissions";
import { useGetInventoryCounts } from "../hooks";
import type { InventoryCountDocument } from "../types/type";

export default function InventoryCountListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } = useGetInventoryCounts(searchParams);

  const tableColumns: TableColumnsType<InventoryCountDocument> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), align: "center" },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => <Link to={`${record.id}`}>{value ?? record.id}</Link>,
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "warehouseName",
      title: "Ombor",
      render: (_, record) => record.warehouseName ?? record.warehouseId,
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

  const hasActions = permissions.includes(inventoryCountPermissions.delete);
  const columns: TableColumnType<InventoryCountDocument>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={inventoryCountEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: record.statusId === 1 ? inventoryCountPermissions.delete : "",
                editCode: record.statusId === 1 ? inventoryCountPermissions.update : "",
              }}
              refetch={() => void refetch()}
              customPath={`/main/warehouses/inventory-counts/${record.id}`}
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
          <PermissionCard permission={inventoryCountPermissions.create}>
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
        <Table<InventoryCountDocument>
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
