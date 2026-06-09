import ButtonAdd from "@/components/ui/buttons/ButtonAdd";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { rolePermission } from "@/modules/settings/constants/permissions";
import { useRoleGetList } from "@/modules/settings/features/settings/role/addedit/hook/useRoleGetList";
import { RolesData } from "@/modules/settings/types/settings";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { Table, TableColumnType, Tag } from "antd";
import { useTranslation } from "react-i18next";

const Role = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth?.user);
  const { data, isLoading, isFetching, refetch } = useRoleGetList(
    user?.user.organizationId,
  );
  const tableColumnLabels: TableColumnType<RolesData>[] = [
    {
      dataIndex: "indexId",
      title: t("Table.ordinalNumber"),
      align: "center",
      width: 70,
    },
    {
      dataIndex: "shortName",
      title: t("Table.role"),
      minWidth: 140,
      width: 200,
    },
    {
      dataIndex: "state",
      title: t("Table.state"),
      width: 110,
      align: "center",
      render(value, record) {
        return (
          <Tag color={record.stateId === 1 ? "green" : "red"}>{value}</Tag>
        );
      },
    },
  ];
  const hasActions =
    user?.user.permissions.includes(rolePermission.UPDATE) ||
    user?.user.permissions.includes(rolePermission.DELETE);

  const columns: TableColumnType<RolesData>[] = hasActions
    ? [
        ...tableColumnLabels,
        {
          dataIndex: "actions",
          title: t("Table.actions"),
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
                deleteCode: rolePermission.DELETE,
                editCode: rolePermission.UPDATE,
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumnLabels;
  return (
    <div className="w-full">
      <div className="mb-3 flex justify-between items-center">
        <PermissionCard permission={rolePermission.CREATE}>
          <ButtonAdd to="/main/role/add" />
        </PermissionCard>
        <div className="flex items-center gap-2">
          <SearchFilter />
        </div>
      </div>
      <Table
        dataSource={generateKeyTable(data?.results)}
        virtual={data?.results.length > 100}
        pagination={false}
        scroll={{
          x: "max-screen",
          y: "calc(100vh - 340px)",
        }}
        loading={isLoading || isFetching}
        columns={columns}
      />
    </div>
  );
};

export default Role;
