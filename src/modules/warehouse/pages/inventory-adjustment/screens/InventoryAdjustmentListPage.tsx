import { Link, useSearchParams } from "react-router";
import { Button, Space, Table, Tag, Tooltip } from "antd";
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
import { inventoryAdjustmentEndpoints } from "../constants/endpoints";
import { inventoryAdjustmentPermissions } from "../constants/permissions";
import { useGetInventoryAdjustments } from "../hooks";
import type { InventoryAdjustmentDocument } from "../types/type";

export default function InventoryAdjustmentListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetInventoryAdjustments(searchParams);

  const tableColumns: TableColumnsType<InventoryAdjustmentDocument> = [
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
      title: t("menu.warehouse"),
      render: (_, record) => record.warehouseName ?? record.warehouseId,
    },
    {
      dataIndex: "adjustmentType",
      title: t("warehouse.fields.adjustmentType"),
      render: (value) => (
        <Tag color={String(value).toLowerCase() === "increase" ? "green" : "red"}>
          {value}
        </Tag>
      ),
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

  const hasActions = permissions.includes(inventoryAdjustmentPermissions.delete);
  const columns: TableColumnType<InventoryAdjustmentDocument>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={inventoryAdjustmentEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode:
                  record.statusId === 1 ? inventoryAdjustmentPermissions.delete : "",
                editCode:
                  record.statusId === 1 ? inventoryAdjustmentPermissions.update : "",
              }}
              refetch={() => void refetch()}
              customPath={`/main/warehouses/inventory-adjustments/${record.id}`}
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
          <PermissionCard permission={inventoryAdjustmentPermissions.create}>
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
        <Table<InventoryAdjustmentDocument>
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
