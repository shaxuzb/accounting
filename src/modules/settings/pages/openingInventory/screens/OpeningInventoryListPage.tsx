import { useNavigate, useSearchParams } from "react-router";
import { Alert, App, Button, Empty, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Trash2, Pencil, RefreshCw, ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetOpeningInventories } from "../hooks/useGetOpeningInventories";
import { useDeleteOpeningInventory } from "../hooks/useDeleteOpeningInventory";
import type { OpeningInventoryListItem } from "../types/type";
import { customDate, numberSpacing } from "@/utils/utils";
import PermissionCard from "@/components/ui/card/PermissionCard";
import Card from "@/components/ui/card/Card";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { openingInventoryPermissions } from "../constants/permissions";
import ListPagination from "@/components/ui/table/ListPagination";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";

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
      title: t("common.deleteConfirm"),
      okText: t("common.delete"),
      cancelText: t("common.cancel"),
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
      title: t("purchase.fields.docDate"),
      dataIndex: "docDate",
      key: "docDate",
      render: (date: string) => customDate(date),
    },
    {
      title: t("products.fields.supplier"),
      dataIndex: "counterpartyName",
      key: "counterpartyName",
      render: (value: string, record) =>
        record.openingInventoryMode === "services" || record.isService
          ? value || "Ijrochi"
          : value,
    },
    {
      title: t("payroll.fields.componentType"),
      key: "openingInventoryMode",
      width: 120,
      render: (_, record) =>
        record.openingInventoryMode === "services" || record.isService
          ? "Xizmat"
          : "Tovar",
    },
    {
      title: t("menu.warehouse"),
      dataIndex: "warehouseName",
      key: "warehouseName",
    },
    {
      title: t("app.fields.amount"),
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => numberSpacing(amount),
    },
    {
      title: t("settings.fields.comment"),
      dataIndex: "comment",
      key: "comment",
    },
    {
      title: t("common.actions"),
      key: "actions",
      align: "right",
      width: 160,
      render: (_, record) => (
        <Space size="middle">
          {/* Boshlang'ich qoldiq endi Dt 2910 / Kt 0000 provodkasini beradi. */}
          <AccountingEntriesButton
            type="text"
            icon={<ScrollText className="size-4 text-emerald-600" />}
            documentTypeId={16}
            documentId={record.id}
            statusId={record.statusId}
          />
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
                {t("common.create")}</Button>
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
              message={t("openingInventory.messages.loadError")}
              action={
                <Button size="small" onClick={() => refetch()}>
                  {t("openingInventory.actions.retry")}
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
                  description={t("openingInventory.messages.empty")}
                />
              ),
            }}
            pagination={false}
            scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
          />
          <ListPagination
            current={currentPage}
            pageSize={pageSize}
            total={data?.totalCount ?? data?.total ?? 0}
            onChange={handlePaginationChange}
          />
        </Card>
      </div>
    </PermissionCard>
  );
}
