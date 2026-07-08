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

export default function InventoryCountListPage() {
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
        title: "Hujjat raqami",
        render: (value, record) => (
          <Link to={`/main/warehouses/inventory-counts/${record.id}`}>
            {value ?? record.id}
          </Link>
        ),
      },
      {
        dataIndex: "docDate",
        title: "Sana",
        render: (value) => customDate(value),
      },
      {
        dataIndex: "warehouseName",
        title: "Ombor",
        render: (_, record) => record.warehouseName ?? record.warehouseId,
      },
      {
        dataIndex: "statusName",
        title: "Status",
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
        title: "Holat",
        align: "center",
      },
      {
        dataIndex: "isCountCompleted",
        title: "Sanoq",
        align: "center",
        render: (value) => (value ? "Tugallangan" : "Jarayonda"),
      },
      {
        dataIndex: "createdDate",
        title: "Yaratilgan sana",
        render: (value) => (value ? customDate(value) : "-"),
      },
      {
        dataIndex: "positiveAdjustmentDocId",
        title: "Musbat tuzatish",
        align: "center",
        render: (_, record) =>
          record.positiveAdjustmentDocId ? (
            <Link
              to={`/main/warehouses/inventory-adjustments/${record.positiveAdjustmentDocId}`}
            >
              {record.positiveAdjustmentDocId}
            </Link>
          ) : (
            "yaratilmagan"
          ),
      },
      {
        dataIndex: "negativeAdjustmentDocId",
        title: "Manfiy tuzatish",
        align: "center",
        render: (_, record) =>
          record.negativeAdjustmentDocId ? (
            <Link
              to={`/main/warehouses/inventory-adjustments/${record.negativeAdjustmentDocId}`}
            >
              {record.negativeAdjustmentDocId}
            </Link>
          ) : (
            "yaratilmagan"
          ),
      },
      {
        dataIndex: "id",
        title: "Amallar",
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
                    Ko'rish
                  </Button>
                </Link>
              )}
              {canEdit && (
                <Link
                  to={`/main/warehouses/inventory-counts/${record.id}/edit${buildQuery({ tab: "products" })}`}
                >
                  <Button type="link" size="small">
                    Tahrirlash
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
                    Farqlar
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
                    Tasdiqlash
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
                    Bekor qilish
                  </Button>
                </Link>
              )}
              {canDelete && (
                <Popconfirm
                  title="Hujjatni o'chirish"
                  description="Rostdan ham hujjatni o'chirmoqchimisiz?"
                  okText="O'chirish"
                  cancelText="Bekor qilish"
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
                    O'chirish
                  </Button>
                </Popconfirm>
              )}
            </Space>
          );
        },
      },
    ],
    [deleteMutation, permissions],
  );

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <PermissionCard permission={inventoryCountPermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                Yangi inventarizatsiya
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
