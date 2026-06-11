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
import CashBoxAddEditPage from "./CashBoxAddEditPage";
import { useGetListCashBox } from "../hooks/useGetListCashBox";
import type { CashBox } from "../types/type";
import { cashBoxPermissions } from "../constants/permissions";


export default function CashBoxListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListCashBox(searchParams);

  const tableColumns: TableColumnsType<CashBox> = [
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
      title: t("settings.fields.branchName"),
      dataIndex: "branchName",
      minWidth: 180,
    },
    {
      title: t("settings.fields.code"),
      dataIndex: "code",
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
    permissions.includes(cashBoxPermissions.update) ||
    permissions.includes(cashBoxPermissions.delete);

  const columns: TableColumnType<CashBox>[] = hasActions
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
              deletePath="cash-boxes"
              customPath={`/main/settings/cash-boxes/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: cashBoxPermissions.delete,
                editCode: cashBoxPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as CashBox)?.id ?? null),
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
          <PermissionCard permission={cashBoxPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >{t("common.add")}</Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<CashBox>
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
       <CashBoxAddEditPage
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
