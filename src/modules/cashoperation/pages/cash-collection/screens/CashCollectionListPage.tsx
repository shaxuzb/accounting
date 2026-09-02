import { useState } from "react";
import { Button, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useSearchParams } from "react-router";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { useGetCashCollections } from "../hooks";
import { cashCollectionPermissions } from "../constants/permissions";
import type { CashCollectionDocument } from "../types/type";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import CashCollectionDetailPage from "./CashCollectionDetailPage";

export default function CashCollectionListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetCashCollections(searchParams);

  const openEdit = (id: number) => {
    setEditId(id);
    setIsFormOpen(true);
  };

  const columns: TableColumnsType<CashCollectionDocument> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 45,
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => {
        const label = value ?? record.id;

        if (record.statusId === 1) {
          return (
            <Button
              type="link"
              className="h-auto p-0"
              onClick={() => openEdit(record.id)}
            >
              {label}
            </Button>
          );
        }

        return (
          <Link to={"/main/cash-operationses/cash-collection/" + record.id}>
            {label}
          </Link>
        );
      },
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "cashBoxName",
      title: t("settings.entities.cashBox"),
      render: (_, record) => record.cashBoxName ?? record.cashBoxId,
    },
    {
      dataIndex: "bankAccountNumber",
      title: t("bank.fields.bankAccount"),
      render: (_, record) => record.bankAccountNumber ?? record.bankAccountId,
    },
    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "center",
      render: (value, record) =>
        [numberSpacing(value), record.currencyCode ?? ""].join(" "),
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

  if (
    permissions.includes(cashCollectionPermissions.update) ||
    permissions.includes(cashCollectionPermissions.delete)
  ) {
    columns.push({
      dataIndex: "actions",
      title: t("common.actions"),
      fixed: "right",
      render: (_, record) => (
        <ActionColumn
          deletePath="cash-collection-docs"
          customPath={"/main/cash-operationses/cash-collection/" + record.id}
          record={record}
          permissions={permissions}
          permissionsCode={{
            editCode:
              record.statusId === 1 ? cashCollectionPermissions.update : "",
            deleteCode:
              record.statusId === 1 ? cashCollectionPermissions.delete : "",
          }}
          refetch={() => void refetch()}
          editModal={{
            isModal: true,
            setOpenEditModal: setIsFormOpen,
            setEditData: (value: unknown) =>
              setEditId((value as CashCollectionDocument)?.id ?? null),
          }}
        />
      ),
    });
  }

  const openCreate = () => {
    setEditId(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditId(null);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={cashCollectionPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={openCreate}
            >
              {t("cash.collection.create")}
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<CashCollectionDocument>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 220px)" }}
        />
      </Card>
      <CashCollectionDetailPage
        open={isFormOpen}
        id={editId}
        onClose={closeForm}
      />
    </div>
  );
}
