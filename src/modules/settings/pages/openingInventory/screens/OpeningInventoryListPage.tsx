import { useNavigate, useSearchParams } from "react-router";
import { Alert, App, Button, Empty, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Trash2, Pencil, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetOpeningInventories } from "../hooks/useGetOpeningInventories";
import { useDeleteOpeningInventory } from "../hooks/useDeleteOpeningInventory";
import type { OpeningInventoryListItem } from "../types/type";
import { customDate, numberSpacing } from "@/utils/utils";
import PermissionCard from "@/components/ui/card/PermissionCard";
import Card from "@/components/ui/card/Card";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { openingInventoryPermissions } from "../constants/permissions";

const toPositiveInteger = (value: string | null, fallback: number) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
};

export default function OpeningInventoryListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading, isError, isFetching, refetch } = useGetOpeningInventories(searchParams);

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
  const deleteMutation = useDeleteOpeningInventory();

  const handleDelete = (id: number) => {
    modal.confirm({
      title: "Haqiqatan ham o'chirmoqchimisiz?",
      okText: "O'chirish",
      cancelText: "Bekor qilish",
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  const handlePaginationChange = (page: number, nextPageSize: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPageSize === pageSize ? page : 1));
    nextParams.set("pageSize", String(nextPageSize));
    setSearchParams(nextParams, { replace: true });
  };

  const columns: ColumnsType<OpeningInventoryListItem> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber") || "T/r",
      width: 60,
    },
    {
      title: "Sana",
      dataIndex: "docDate",
      key: "docDate",
      render: (date: string) => customDate(date),
    },
    {
      title: "Yetkazib beruvchi",
      dataIndex: "counterpartyName",
      key: "counterpartyName",
      render: (value: string, record) =>
        record.openingInventoryMode === "services" || record.isService
          ? value || "Ijrochi"
          : value,
    },
    {
      title: "Turi",
      key: "openingInventoryMode",
      width: 120,
      render: (_, record) =>
        record.openingInventoryMode === "services" || record.isService
          ? "Xizmat"
          : "Tovar",
    },
    {
      title: "Ombor",
      dataIndex: "warehouseName",
      key: "warehouseName",
    },
    {
      title: "Summa",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => numberSpacing(amount),
    },
    {
      title: "Izoh",
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: "Amallar",
      key: "actions",
      align: "right",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <PermissionCard permission={openingInventoryPermissions.update}>
            <Button
              type="text"
              icon={<Pencil className="size-4 text-blue-500" />}
              onClick={() => navigate(`edit/${record.id}`)}
            />
          </PermissionCard>
          <PermissionCard permission={openingInventoryPermissions.delete}>
            <Button
              type="text"
              danger
              icon={<Trash2 className="size-4 text-red-500" />}
              onClick={() => handleDelete(record.id)}
            />
          </PermissionCard>
        </Space>
      ),
    },
  ];

  return (
    <PermissionCard permission={openingInventoryPermissions.view}>
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <SearchFilter />
          </div>
          <Space>
            <PermissionCard permission={openingInventoryPermissions.create}>
              <Button
                type="primary"
                icon={<Plus className="size-4" />}
                onClick={() => navigate("add")}
              >
                Yaratish
              </Button>
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
              message="Boshlang'ich qoldiqlarni yuklashda xatolik yuz berdi"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Qayta urinish
                </Button>
              }
            />
          )}
          <Table
            loading={isLoading || isFetching}
            dataSource={tableData}
            columns={columns}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Boshlang'ich qoldiqlar topilmadi"
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
    </PermissionCard>
  );
}
