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
import type { OrgBankAccounts } from "../types/type";
import { useGetListOrgBankAccounts } from "../hooks";
import { orgBankAccountsPermissions } from "../constants/permissions";
import OrgBankAccountsAddPage from "./addedit";

export default function OrgBankAccountstListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const { data, refetch, isLoading, isFetching } =
    useGetListOrgBankAccounts(searchParams);

  const tableColumns: TableColumnsType<OrgBankAccounts> = [
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
      title: "organizationName",
      dataIndex: "organizationName",
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
    permissions.includes(orgBankAccountsPermissions.update) ||
    permissions.includes(orgBankAccountsPermissions.delete);

  const columns: TableColumnType<OrgBankAccounts>[] = hasActions
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
              deletePath="org-bank-accounts"
              customPath={`/main/settings/org-bank-accounts/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: orgBankAccountsPermissions.delete,
                editCode: orgBankAccountsPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditId((value as OrgBankAccounts)?.id ?? null),
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
            permission={orgBankAccountsPermissions.create}
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
        <Table<OrgBankAccounts>
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
      <OrgBankAccountsAddPage
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
