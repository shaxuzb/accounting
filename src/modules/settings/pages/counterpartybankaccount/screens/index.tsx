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
import { useGetListCounterpartybankaccount } from "../hooks";
import type { Counterpartybankaccount } from "../types/type";
import { counterpartybankaccountPermissions } from "../constants/permissions";
import CounterPartyBankAccountAddPage from "./addedit";

export default function CounterpartyBankAccountListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListCounterpartybankaccount(searchParams);

  const tableColumns: TableColumnsType<Counterpartybankaccount> = [
    {
      dataIndex: "indexId",
      title: t("T/r"),
      align: "center",
      width: 70,
    },
    {
      title: "Bank name",
      dataIndex: "bankName",
      minWidth: 180,
    },
    {
      title: "accountNumber",
      dataIndex: "accountNumber",
      minWidth: 180,
    },
    {
      title: "counterpartyName",
      dataIndex: "counterpartyName",
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
    permissions.includes(counterpartybankaccountPermissions.update) ||
    permissions.includes(counterpartybankaccountPermissions.delete);

  const columns: TableColumnType<Counterpartybankaccount>[] = hasActions
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
              deletePath="counterparty-bank-accounts"
              customPath={`/main/settings/counterparty-bank-accounts/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: counterpartybankaccountPermissions.delete,
                editCode: counterpartybankaccountPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as Counterpartybankaccount)?.id ?? null),
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
          <PermissionCard
            permission={counterpartybankaccountPermissions.create}
          >
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
        <Table<Counterpartybankaccount>
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
      <CounterPartyBankAccountAddPage
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
