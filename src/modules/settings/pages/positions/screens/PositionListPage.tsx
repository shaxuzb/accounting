import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { generateKeyTable } from "@/utils/utils";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useState } from "react";
import { useGetListPositions } from "../hooks";
import type { Positions } from "../types/type";
import { positionsPermissions } from "../constants/permissions";
import PositionAddEditPage from "./PositionAddEditPage";

export default function PositionListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListPositions(searchParams);

  const tableColumns: TableColumnsType<Positions> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      title: t("settings.fields.name"),
      dataIndex: "name",
      minWidth: 180,
    },
    {
      title: t("settings.fields.code"),
      dataIndex: "code",
      minWidth: 180,
    },
    {
      title: t("settings.fields.organizationName"),
      dataIndex: "organizationName",
      minWidth: 160,
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "stateId",
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(positionsPermissions.update) ||
    permissions.includes(positionsPermissions.delete);

  const columns: TableColumnType<Positions>[] = hasActions
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
              deletePath="positions"
              customPath={`/main/settings/positions/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: positionsPermissions.delete,
                editCode: positionsPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as Positions)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
          />
          <PermissionCard permission={positionsPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >{t("common.add")}</Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<Positions>
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
      <PositionAddEditPage
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
