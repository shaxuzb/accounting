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
import { customDate, generateKeyTable } from "@/utils/utils";
import { settingsBankPermissions } from "../constants/permissions";
import { useGetListSettingsBank } from "../hooks";
import type { SettingsBank } from "../types/type";
import SettingsBankAddEditPage from "./SettingsBankAddEditPage";

export default function SettingsBankListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListSettingsBank(searchParams);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const tableColumns: TableColumnsType<SettingsBank> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "code",
      title: t("settings.fields.code"),
      width: 140,
    },
    {
      dataIndex: "name",
      title: t("settings.fields.name"),
      minWidth: 220,
    },
    {
      dataIndex: "mfo",
      title: t("settings.fields.mfo"),
      width: 140,
      render: (value: string | null) => value || "-",
    },

    {
      dataIndex: "createdDate",
      title: t("settings.fields.createdDate"),
      align: "center",
      width: 180,
      render: customDate,
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
  const hasActions =
    permissions.includes(settingsBankPermissions.update) ||
    permissions.includes(settingsBankPermissions.delete);

  const columns: TableColumnType<SettingsBank>[] = hasActions
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
              deletePath="banks"
              customPath={`/main/settings/banks/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: settingsBankPermissions.delete,
                editCode: settingsBankPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as SettingsBank)?.id ?? null),
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
            onClick={() => refetch()}
          />
          <PermissionCard permission={settingsBankPermissions.create}>
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
        <Table<SettingsBank>
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

      <SettingsBankAddEditPage
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
