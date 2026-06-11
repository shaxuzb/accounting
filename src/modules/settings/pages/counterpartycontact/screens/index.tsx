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
import CounterpartyContactsAddPage from "./addedit";
import { useGetListCounterpartycontact } from "../hooks/useGetListCounterpartycontact";
import { counterpartyContactPermissions } from "../constants/permissions";
import type { CounterpartyContact } from "../types/type";



export default function CounterpartyContactsListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListCounterpartycontact(searchParams);

  const tableColumns: TableColumnsType<CounterpartyContact> = [
    {
      dataIndex: "indexId",
      title: t("T/r"),
      align: "center",
      width: 70,
    },
    {
      title: "fullname",
      dataIndex: "fullName",
      minWidth: 180,
    },
    {
      title: "phoneNumber",
      dataIndex: "phoneNumber",
      minWidth: 180,
    },
    {
      title: "position",
      dataIndex: "position",
      minWidth: 160,
    },
    {
      title: "Holati",
      dataIndex: "stateId",
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(counterpartyContactPermissions.update) ||
    permissions.includes(counterpartyContactPermissions.delete);

  const columns: TableColumnType<CounterpartyContact>[] = hasActions
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
              deletePath="counterparty-contacts"
              customPath={`/main/settings/counterparty-contacts/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: counterpartyContactPermissions.delete,
                editCode: counterpartyContactPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as CounterpartyContact)?.id ?? null),
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
            onClick={() => void refetch()}
          />
          <PermissionCard permission={counterpartyContactPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >
              Qo'shish
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<CounterpartyContact>
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
       <CounterpartyContactsAddPage
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
