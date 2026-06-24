import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useAppSelector } from "@/store/hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { generateKeyTable } from "@/utils/utils";
import { purchasePermissions } from "@/modules/purchase/pages/purchase/constants/permissions";
import { purchaseServicePermissions } from "../constants/permissions";
import { useGetListPurchaseService } from "../hooks";
import type { PurchaseService } from "../types/type";
import PurchaseServiceAddEditPage from "./PurchaseServiceAddEditPage";

export default function PurchaseServiceListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListPurchaseService(searchParams);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const tableColumns: TableColumnsType<PurchaseService> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "name",
      title: t("settings.fields.name"),
      minWidth: 180,
    },
    {
      dataIndex: "description",
      title: t("settings.fields.description"),
      minWidth: 220,
      render: (value: string | null) => value || "-",
    },
    {
      dataIndex: "serviceTypeName",
      title: t("settings.fields.serviceType"),
      minWidth: 150,
      render: (_, record) => record.serviceTypeName || record.serviceTypeId,
    },
    {
      dataIndex: "stateId",
      title: t("settings.fields.status"),
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const permissions = user?.user.permissions ?? [];
  const editPermission = permissions.includes(purchaseServicePermissions.update)
    ? purchaseServicePermissions.update
    : purchasePermissions.update;
  const deletePermission = permissions.includes(purchaseServicePermissions.delete)
    ? purchaseServicePermissions.delete
    : purchasePermissions.delete;
  const hasActions =
    permissions.includes(editPermission) || permissions.includes(deletePermission);

  const columns: TableColumnType<PurchaseService>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="purchase-services"
              customPath={`/main/settings/purchase-services/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: deletePermission,
                editCode: editPermission,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as PurchaseService)?.id ?? null),
              }}
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
          <PermissionCard
            permission={[
              purchaseServicePermissions.create,
              purchasePermissions.create,
            ]}
          >
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
        </Space>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<PurchaseService>
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{
            x: "max-content",
            y: "calc(100vh - 350px)",
          }}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
        />
      </Card>

      <PurchaseServiceAddEditPage
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditId(null);
        }}
        id={editId}
      />
    </div>
  );
}
