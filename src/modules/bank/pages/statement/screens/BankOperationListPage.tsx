import { Link, useSearchParams } from "react-router";
import { Button, Space, Table, Tooltip } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { FileUp, Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { bankStatementEndpoints } from "../constants/endpoints";
import { bankPermissions } from "../constants/permissions";
import { useGetBankOperations } from "../hooks";
import type { BankOperationData } from "../types/type";
import BankOperationAddEditPage from "./BankOperationAddEditPage";
import SearchFilter from "@/components/ui/filters/SearchFilter";


export default function BankOperationListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<BankOperationData | null>(null);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetBankOperations(searchParams);

  const tableColumns: TableColumnsType<BankOperationData> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "bankAccountName",
      title: t("bank.fields.bankAccount"),
      align: "center",
      render: (_, record) => record.bankAccountName ?? record.bankAccountId,
    },
    {
      dataIndex: "operationTypeName",
      title: t("bank.fields.operationType"),
      render: (_, record) => record.operationTypeName ?? record.operationTypeId,
    },
    {
      dataIndex: "counterpartyName",
      title: t("bank.fields.counterparty"),
      render: (_, record) => record.counterpartyName ?? record.counterpartyId,
    },
    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "center",
      render: (value) => numberSpacing(value)+" UZS",
    },
    {
      dataIndex: "comment",
      title: t("bank.fields.comment"),
      width: 200,
      render: (value) => {
        return (
          <Tooltip title={value}>
            <span className="line-clamp-2">{value}</span>
          </Tooltip>
        );
      },
    },
  ];

  const hasActions =
    permissions.includes(bankPermissions.update) ||
    permissions.includes(bankPermissions.delete);
  const columns: TableColumnType<BankOperationData>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          width: 90,
          render: (_, record) => (
            <ActionColumn
              deletePath={bankStatementEndpoints.operations.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: bankPermissions.delete,
                editCode: bankPermissions.update,
              }}
              refetch={refetch}
              editModal={{
                isModal: true,
                setOpenEditModal: setIsAddOpen,
                setEditData: (value: unknown) =>
                  setEditRecord(value as BankOperationData),
              }}
            />
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <PermissionCard permission={[bankPermissions.create, "ROLE_VIEW"]}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => {
                setEditRecord(null);
                setIsAddOpen(true);
              }}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
          <PermissionCard permission={[bankPermissions.create, "ROLE_VIEW"]}>
            <Link to="import">
              <Button type="primary" icon={<FileUp className="size-4" />}>
                {t("common.import")}
              </Button>
            </Link>
          </PermissionCard>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => refetch()}
          />
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<BankOperationData>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
      </Card>
      <BankOperationAddEditPage
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditRecord(null);
          void refetch();
        }}
        record={editRecord}
      />
    </div>
  );
}
