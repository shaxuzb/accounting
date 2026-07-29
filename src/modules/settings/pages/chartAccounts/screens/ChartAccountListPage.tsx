import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { BookPlus, Plus, RefreshCw } from "lucide-react";
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
import ChartAccountAddEditPage from "./ChartAccountAddEditPage";
import { ChartAccountPresetModal } from "../components";
import type { ChartAccounts } from "../types/type";
import { useGetListChartAccounts } from "../hooks";
import { chartAccountsPermissions } from "../constants/permissions";

export default function ChartAccountListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListChartAccounts(searchParams);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const tableColumns: TableColumnsType<ChartAccounts> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      title: t("settings.fields.name"),
      dataIndex: "number",
    },
    {
      title: t("settings.fields.name"),
      dataIndex: "name",
    },
    {
      title: t("AccountypeName"),
      dataIndex: "accountTypeName",
    },

    {
      title: t("settings.fields.status"),
      dataIndex: "stateId",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(chartAccountsPermissions.update) ||
    permissions.includes(chartAccountsPermissions.delete);

  const columns: TableColumnType<ChartAccounts>[] = hasActions
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
              deletePath="chart-accounts"
              customPath={`/main/settings/chart-accounts/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: chartAccountsPermissions.delete,
                editCode: chartAccountsPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as ChartAccounts)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={chartAccountsPermissions.create}>
            <Button
              icon={<BookPlus className="size-4" />}
              onClick={() => setIsPresetOpen(true)}
            >
              Hisob qo'shish
            </Button>
          </PermissionCard>
          <PermissionCard permission={chartAccountsPermissions.create}>
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
        <Table<ChartAccounts>
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{
            x: "max-content",
            y: "calc(100vh - 200px)",
          }}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
        />
      </Card>
      <ChartAccountAddEditPage
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditId(null);
        }}
        id={editId}
      />

      <ChartAccountPresetModal
        open={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        onCreated={() => refetch()}
      />
    </div>
  );
}
