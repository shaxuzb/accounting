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
import DepartmentAddEditPage from "./DepartmentAddEditPage";
import type { Departments } from "../types/type";
import { departmentsPermissions } from "../constants/permissions";
import { useGetListDepartments } from "../hooks";



export default function DepartmentListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } = useGetListDepartments(searchParams);

  const tableColumns: TableColumnsType<Departments> = [
    {
      dataIndex: "indexId",
      title: t("T/r"),
      align: "center",
      width: 70,
    },
        {
      title: " name",
      dataIndex: "name",
      minWidth: 180,
    },
    {
      title: "organization name",
      dataIndex: "organizationName",
      minWidth: 180,
    },
    {
      title: "Branch name",
      dataIndex: "branchName",
      minWidth: 160,
    },
    {
      title: "Holati",
      dataIndex: "stateName",
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(departmentsPermissions.update) ||
    permissions.includes(departmentsPermissions.delete);

  const columns: TableColumnType<Departments>[] = hasActions
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
              deletePath="departments"
              customPath={`/main/settings/departments/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: departmentsPermissions.delete,
                editCode: departmentsPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsEditOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as Departments)?.id ?? null),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button icon={<RefreshCw className="size-4" />} onClick={() => void refetch()} />
          <PermissionCard permission={departmentsPermissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => setIsAddOpen(true)}>
              Qo'shish
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<Departments>
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
      <DepartmentAddEditPage open={isAddOpen} onClose={() => setIsAddOpen(false)} />
       {isEditOpen && editId && (
              <DepartmentAddEditPage
                open={isEditOpen}
                onClose={() => {
                  setIsEditOpen(false);
                  setEditId(null);
                }}
                id={editId}
              />
            )}
    </div>
  );
}
