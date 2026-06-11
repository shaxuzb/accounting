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
import BranchAddEditPage from "./BranchAddEditPage";
import type { Branches } from "../types/type";
import { useGetListBranches } from "../hooks";
import { branchesPermissions } from "../constants/permissions";

export default function BranchListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListBranches(searchParams);

  const tableColumns: TableColumnsType<Branches> = [
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
      title: t("settings.fields.organizationName"),
      dataIndex: "organizationName",
      minWidth: 180,
    },
    {
      title: t("settings.fields.district"),
      dataIndex: "districtName",
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
    permissions.includes(branchesPermissions.update) ||
    permissions.includes(branchesPermissions.delete);

  const columns: TableColumnType<Branches>[] = hasActions
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
              deletePath="branches"
              customPath={`/main/settings/branches/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: branchesPermissions.delete,
                editCode: branchesPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as Branches)?.id ?? null),
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
          <PermissionCard permission={branchesPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setIsAddOpen(true)}
            >{t("common.add")}</Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<Branches>
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
       <BranchAddEditPage
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
