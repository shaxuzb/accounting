import { Link, useSearchParams } from "react-router";
import { Button, Popconfirm, Space, Table, type TableColumnsType } from "antd";
import { useMemo } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import PermissionCard from "@/components/ui/card/PermissionCard";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { inventoryCountPermissions } from "../constants/permissions";
import { useDeleteInventoryCount, useGetInventoryCounts } from "../hooks";
import type { InventoryCountDocument } from "../types/type";
import { useTranslation } from "react-i18next";

export default function InventoryCountListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetInventoryCounts(searchParams);
  const deleteMutation = useDeleteInventoryCount();

  const columns = useMemo<TableColumnsType<InventoryCountDocument>>(
    () => [
      { dataIndex: "indexId", title: "#", align: "center" },
      {
        dataIndex: "docNumber",
        title: t("warehouse.fields.documentNumber"),
        render: (value, record) => (
          <Link to={`/main/warehouses/inventory-counts/${record.id}`}>
            {value ?? record.id}
          </Link>
        ),
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
      {
        dataIndex: "stateName",
        title: t("warehouse.count.state"),
        align: "center",
      },
      {
        dataIndex: "isCountCompleted",
        title: t("warehouse.count.count"),
        align: "center",
        render: (value) =>
          value
            ? t("warehouse.count.completed")
            : t("warehouse.count.inProgress"),
      },
      {
        dataIndex: "createdDate",
        title: t("warehouse.fields.createdDate"),
        render: (value) => (value ? customDate(value) : "-"),
      },
      {
        dataIndex: "positiveAdjustmentDocId",
        title: t("warehouse.count.positiveAdjustment"),
        align: "center",
        render: (_, record) =>
          record.positiveAdjustmentDocId ? (
            <Link
              to={`/main/warehouses/inventory-adjustments/${record.positiveAdjustmentDocId}`}
            >
              {record.positiveAdjustmentDocId}
            </Link>
          ) : (
            t("warehouse.count.notCreated")
          ),
      },
      {
        dataIndex: "negativeAdjustmentDocId",
        title: t("warehouse.count.negativeAdjustment"),
        align: "center",
        render: (_, record) =>
          record.negativeAdjustmentDocId ? (
            <Link
              to={`/main/warehouses/inventory-adjustments/${record.negativeAdjustmentDocId}`}
            >
              {record.negativeAdjustmentDocId}
            </Link>
          ) : (
            t("warehouse.count.notCreated")
          ),
      },
      {
        dataIndex: "id",
        title: t("common.actions"),
        fixed: "right",
        align: "center",
        render: (_, record) => {
          const canEdit =
            !record.postedAt &&
            !record.cancelledAt &&
            permissions.includes(inventoryCountPermissions.update);
          const canDelete =
            !record.postedAt &&
            !record.cancelledAt &&
            permissions.includes(inventoryCountPermissions.delete);
          const canDifferences = Boolean(record.isCountCompleted);
          const canConfirm =
            Boolean(record.isCountCompleted) &&
            !record.postedAt &&
            !record.cancelledAt &&
            permissions.includes(inventoryCountPermissions.confirm);
          const canCancel =
            !record.postedAt &&
            !record.cancelledAt &&
            permissions.includes(inventoryCountPermissions.cancel);

          const buildQuery = (values: Record<string, string>) => {
            const nextParams = new URLSearchParams();
            Object.entries(values).forEach(([key, value]) =>
              nextParams.set(key, value),
            );
            const params = nextParams.toString();
            return params ? `?${params}` : "";
          };

          return (
            <Space size="small" wrap>
              {permissions.includes(inventoryCountPermissions.detail) && (
                <Link to={`/main/warehouses/inventory-counts/${record.id}`}>
                  <Button type="link" size="small">
                    {t("common.view")}
                  </Button>
                </Link>
              )}
              {canEdit && (
                <Link
                  to={`/main/warehouses/inventory-counts/${record.id}/edit${buildQuery({ tab: "products" })}`}
                >
                  <Button type="link" size="small">
                    {t("common.edit")}
                  </Button>
                </Link>
              )}
              {canDifferences && (
                <Link
                  to={`/main/warehouses/inventory-counts/${record.id}${buildQuery({
                    tab: "differences",
                  })}`}
                >
                  <Button type="link" size="small">
                    {t("warehouse.count.differences")}
                  </Button>
                </Link>
              )}
              {canConfirm && (
                <Link
                  to={`/main/warehouses/inventory-counts/${record.id}${buildQuery({
                    tab: "differences",
                    action: "confirm",
                  })}`}
                >
                  <Button type="link" size="small">
                    {t("common.confirm")}
                  </Button>
                </Link>
              )}
              {canCancel && (
                <Link
                  to={`/main/warehouses/inventory-counts/${record.id}${buildQuery({
                    tab: "products",
                    action: "cancel",
                  })}`}
                >
                  <Button type="link" size="small">
                    {t("common.cancel")}
                  </Button>
                </Link>
              )}
              {canDelete && (
                <Popconfirm
                  title={t("warehouse.count.deleteTitle")}
                  description={t("warehouse.count.deleteQuestion")}
                  okText={t("common.delete")}
                  cancelText={t("common.cancel")}
                  okButtonProps={{ danger: true }}
                  onConfirm={async () => {
                    try {
                      await deleteMutation.mutateAsync(record.id);
                    } catch (error) {
                      errorHandlers(error);
                    }
                  }}
                >
                  <Button
                    type="link"
                    size="small"
                    danger
                    loading={deleteMutation.isPending}
                  >
                    {t("common.delete")}
                  </Button>
                </Popconfirm>
              )}
            </Space>
          );
        },
      },
    ],
    [deleteMutation, permissions, t],
  );

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <PermissionCard permission={inventoryCountPermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("warehouse.count.new")}
              </Button>
            </Link>
          </PermissionCard>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
          />
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
