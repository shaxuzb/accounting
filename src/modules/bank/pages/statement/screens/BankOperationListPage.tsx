import { Link, useSearchParams } from "react-router";
import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { FileUp, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable } from "@/utils/utils";
import { bankStatementEndpoints } from "../constants/endpoints";
import { bankPermissions } from "../constants/permissions";
import { useGetBankOperations } from "../hooks";
import type { BankOperationData } from "../types/type";

const formatDate = (value: string) => {
  const date = dayjs(value);
  return date.isValid() ? date.format("DD.MM.YYYY HH:mm") : value;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("uz-UZ", {
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export default function BankOperationListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
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
      width: 70,
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      width: 170,
      render: (value) => formatDate(value),
    },
    {
      dataIndex: "bankAccountName",
      title: t("bank.fields.bankAccount"),
      minWidth: 180,
      render: (_, record) => record.bankAccountName ?? record.bankAccountId,
    },
    {
      dataIndex: "operationTypeName",
      title: t("bank.fields.operationType"),
      minWidth: 170,
      render: (_, record) => record.operationTypeName ?? record.operationTypeId,
    },
    {
      dataIndex: "counterpartyName",
      title: t("bank.fields.counterparty"),
      minWidth: 200,
      render: (_, record) => record.counterpartyName ?? record.counterpartyId,
    },
    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "right",
      width: 140,
      render: (value) => formatMoney(value),
    },
    {
      dataIndex: "comment",
      title: t("bank.fields.comment"),
      minWidth: 220,
      render: (value) => value || "-",
    },
  ];

  const hasActions = permissions.includes(bankPermissions.delete);
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
              }}
              refetch={refetch}
            />
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-end">
        <Space>
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
    </div>
  );
}
