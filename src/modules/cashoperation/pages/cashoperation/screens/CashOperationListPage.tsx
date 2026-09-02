import { Link, useNavigate, useSearchParams } from "react-router";
import { Button, Space, Table, Tooltip } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, ReceiptText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { cashOperationEndpoints } from "../constants/endpoints";
import { cashOperationPermissions } from "../constants/permissions";
import { useGetCashOperations } from "../hooks";
import type { CashOperation } from "../types/type";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";

export default function CashOperationListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetCashOperations(searchParams);

  const tableColumns: TableColumnsType<CashOperation> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => (
        <Link to={`${record.id}`}>{value ?? record.id}</Link>
      ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: t("app.routes.accountingEntries"),
      align: "center",
      render: (_, record) => (
        <AccountingEntriesButton
          documentTypeId={4}
          documentId={record.id}
          statusId={record.statusId}
          icon={<ReceiptText className="size-4" />}
        />
      ),
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },

    {
      dataIndex: "cashBoxName",
      title: t("settings.entities.cashBox"),
      render: (_, record) => record.cashBoxName ?? record.cashBoxId,
    },
    // {
    //   dataIndex: "cashOperationName",
    //   title: "Kassa amaliyoti",
    //   render: (_, record) => record.cashOperationName ?? record.cashOperationId,
    // },
    {
      dataIndex: "counterpartyName",
      title: t("bank.fields.counterparty"),
      render: (_, record) => record.counterpartyName ?? record.counterpartyId,
    },

    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "center",
      render: (value) => `${numberSpacing(value)} UZS`,
    },
    {
      dataIndex: "comment",
      title: t("bank.fields.comment"),
      render: (value) => (
        <Tooltip title={value}>
          <span className="line-clamp-2">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "statusName",
      align: "center",
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
    },
  ];

  const hasActions =
    permissions.includes(cashOperationPermissions.update) ||
    permissions.includes(cashOperationPermissions.delete);

  const columns: TableColumnType<CashOperation>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={cashOperationEndpoints.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: cashOperationPermissions.delete,
                editCode:
                  record.statusId === 1 ? cashOperationPermissions.update : "",
              }}
              refetch={() => refetch()}
              customPath={`${record.id}/edit`}
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
          <PermissionCard permission={cashOperationPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("add")}
            >
              {t("common.add")}
            </Button>
          </PermissionCard>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<CashOperation>
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
