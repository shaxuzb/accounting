import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Counterparty } from "../types/type";
import { generateKeyTable } from "@/utils/utils";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useState } from "react";
import CounterpartyAddEditPage from "./CounterpartyAddEditPage";
import { useGetListCounterparty } from "../hooks";
import { counterpartyPermissions } from "../constants/permissions";

export default function CounterpartyListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListCounterparty(searchParams);

  const tableColumns: TableColumnsType<Counterparty> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      title: t("settings.fields.fullName"),
      dataIndex: "fullName",
      minWidth: 180,
    },
    {
      title: t("settings.fields.shortName"),
      dataIndex: "shortName",
      minWidth: 160,
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "stateName",
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];
  const permissions = user?.user.permissions ?? [];
  const hasActions =
    permissions.includes(counterpartyPermissions.update) ||
    permissions.includes(counterpartyPermissions.delete);

  const columns: TableColumnType<Counterparty>[] = hasActions
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
              deletePath="counterparty-cards"
              customPath={`/main/settings/counterparty/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: counterpartyPermissions.delete,
                editCode: counterpartyPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as Counterparty)?.id ?? null),
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
          <PermissionCard permission={counterpartyPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >{t("common.add")}</Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<Counterparty>
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
      <CounterpartyAddEditPage
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
