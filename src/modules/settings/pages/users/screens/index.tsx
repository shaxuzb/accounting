import {
  Button,
  Space,
  Table,
  type TableColumnsType,
  type TableColumnType,
} from "antd";

import UsersAddEditModal from "./addedit";
import { useState } from "react";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { customPhoneNumber, generateKeyTable } from "@/utils/utils";
import Card from "@/components/ui/card/Card";
import { userPermissions } from "../constants/permissions";
import { useGetListUsers } from "../hooks";
import { useAppSelector } from "@/store/hooks";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { Plus, RefreshCw } from "lucide-react";
import PermissionCard from "@/components/ui/card/PermissionCard";
import type { Users } from "../types/type";

function UsersPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetListUsers();
  const tableColumns: TableColumnsType<Users> = [
    {
      title: "T/r",
      dataIndex: "indexId",
      width: 50,
      align: "center",
    },
    {
      title: "Foydalanuvchi",
      dataIndex: "userName",
    },
    {
      title: "Tel nomer",
      dataIndex: "phoneNumber",
      align: "center",
      render: (text) => customPhoneNumber(text),
    },
    {
      title: "Holati",
      dataIndex: "state",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(userPermissions.update) ||
    permissions.includes(userPermissions.delete);

  const columns: TableColumnType<Users>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: "Amallar",
          align: "center",
          width: 100,
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath="users"
              record={record}
              permissions={permissions}
              editModal={{
                isModal: true,
                setEditData: (value: unknown) =>
                  setEditId((value as Users).id),
                setOpenEditModal: setIsCrudModalOpen,
              }}
              permissionsCode={{
                deleteCode: userPermissions.delete,
                editCode: userPermissions.update,
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumns;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={userPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsCrudModalOpen(true)}
            >
              Qo'shish
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table
          loading={isLoading || isFetching}
          columns={columns}
          scroll={{
            x: "max-content",
            y: "calc(100vh - 350px)",
          }}
          dataSource={generateKeyTable(data?.items ?? [])}
          pagination={false}
        />
      </Card>
      <UsersAddEditModal
        open={isCrudModalOpen}
        onClose={() => {
          setIsCrudModalOpen(false);
          setEditId(null);
        }}
        editId={editId}
      />
    </div>
  );
}
export default UsersPage;
