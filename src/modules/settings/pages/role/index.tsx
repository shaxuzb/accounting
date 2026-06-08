import { Table } from "antd";
import type { TableColumnsType, TableColumnType } from "antd";
import { useTranslation } from "react-i18next";
import type { Role } from "../../types/settings";
import { useGetListRole } from "../../hooks/role/useGetListRole";
import { generateKeyTable } from "@/utils/utils";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { rolePermissions } from "../../constants/permissions";
import { stateStatus } from "@/utils/helpers/statusHelper";
import Card from "@/components/ui/card/Card";

export default function RoleListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { data, refetch, isLoading } = useGetListRole();

  const tableColumns: TableColumnsType<Role> = [
    {
      dataIndex: "indexId",
      title: t("T/r"),
      align: "center",
      width: 70,
    },
    {
      title: "Nomi",
      dataIndex: "fullName",
    },
    {
      title: "Holati",
      dataIndex: "state",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const hasActions =
    user?.user.permissions.includes(rolePermissions.update) ||
    user?.user.permissions.includes(rolePermissions.delete);

  const columns: TableColumnType<Role>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("Amallar"),
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="roles"
              customPatn={`/main/role/edit/${record.id}`}
              record={record}
              permissions={user?.user.permissions || []}
              permissionsCode={{
                deleteCode: rolePermissions.delete,
                editCode: rolePermissions.update,
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumns;
  return (
    <Card className="border overflow-hidden border-border">
      <Table<Role>
        loading={isLoading}
        columns={columns}
        scroll={{
          x: "max-content",
          y: "calc(100vh - 350px)",
        }}
        dataSource={generateKeyTable(data?.items ?? [])}
        pagination={false}
      />
    </Card>
  );
}
