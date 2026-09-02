import { Link } from "react-router";
import { Button, Tooltip } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { FileUp, Plus, ReceiptText } from "lucide-react";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import RestorableTable from "@/components/ui/table/RestorableTable";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { customDate, numberSpacing } from "@/utils/utils";
import { bankStatementEndpoints } from "../constants/endpoints";
import { bankPermissions } from "../constants/permissions";
import { useGetBankOperations } from "../hooks";
import type { BankOperationData } from "../types/type";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import AccountingEntriesButton from "@/modules/accounting/components/AccountingEntriesButton";
import { usePaginationParams } from "@/shared/hooks/usePaginationParams";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import ListPagination from "@/components/ui/table/ListPagination";

export default function BankOperationListPage() {
  const { t } = useTranslation();
  const { queryParams, withRowNumbers, paginationProps } =
    usePaginationParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetBankOperations(queryParams);

  const tableColumns: TableColumnsType<BankOperationData> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => (
        <Link to={record.statusId === 1 ? `edit/${record.id}` : `${record.id}`}>
          {value ?? record.id}
        </Link>
      ),
    },
    {
      dataIndex: "bankDocumentNumber",
      title: t("bank.fields.bankDocumentNumber"),
      render: (value) => value ?? "-",
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: t("bank.fields.accountingEntries"),
      align: "center",
      render: (_, record) => (
        <AccountingEntriesButton
          documentTypeId={3}
          documentId={record.id}
          statusId={record.statusId}
          icon={<ReceiptText className="size-4" />}
        />
      ),
    },
    // {
    //   dataIndex: "bankAccountName",
    //   title: t("bank.fields.bankAccount"),
    //   align: "center",
    //   render: (_, record) => record.bankAccountName ?? record.bankAccountId,
    // },
    {
      dataIndex: "operationTypeName",
      title: t("bank.fields.operationType"),
      render: (_, record) =>
        record.direction ??
        (record.directionId === 1
          ? t("bank.operation.income")
          : record.directionId === -1
            ? t("bank.operation.expense")
            : (record.operationTypeName ?? record.operationTypeId ?? "-")),
      align: "center",
    },

    {
      dataIndex: "classificationName",
      title: t("bank.fields.classification"),
      render: (_, record) =>
        record.classificationName ?? record.classificationCode ?? "-",
    },
    {
      dataIndex: "counterpartyName",
      title: t("bank.fields.counterparty"),
      align: "center",
      render: (value) => {
        return (
          <Tooltip title={value}>
            <span className="line-clamp-2">{value}</span>
          </Tooltip>
        );
      },
    },
    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "center",
      render: (value) => numberSpacing(value) + " UZS",
    },
    {
      dataIndex: "comment",
      title: t("bank.fields.comment"),
      width: 300,
      render: (value) => {
        return (
          <Tooltip title={value}>
            <span className="line-clamp-1">{value}</span>
          </Tooltip>
        );
      },
      align: "center",
    },
    {
      dataIndex: "statusName",
      title: t("settings.fields.status"),
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
          render: (_, record) => (
            <ActionColumn
              deletePath={bankStatementEndpoints.operations.list}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: bankPermissions.delete,
                editCode: record.statusId === 1 ? bankPermissions.update : "",
              }}
              refetch={refetch}
              customPath={`/main/bank/edit/${record.id}`}
            />
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <SelectFilter
              paramKey="bankAccountId"
              placeholder="bank.fields.bankAccount"
              path={selectListEndpoints.orgBankAccountsSelectList}
              width={220}
              search
            />
            <SelectFilter
              paramKey="directionId"
              placeholder="bank.fields.operationType"
              options={[
                { value: 1, label: "bank.operation.income" },
                { value: -1, label: "bank.operation.expense" },
              ]}
              width={150}
            />
            <DateRangeFilter
              paramKeys={["dateFrom", "dateTo"]}
              placeholderKeys={["bank.fields.dateFrom", "bank.fields.dateTo"]}
              width={260}
            />
          </>
        }
        actions={
          <>
            <PermissionCard permission={[bankPermissions.create, "ROLE_VIEW"]}>
              <Link to="add">
                <Button type="primary" icon={<Plus className="size-4" />}>
                  {t("common.add")}
                </Button>
              </Link>
            </PermissionCard>
            <PermissionCard permission={[bankPermissions.create, "ROLE_VIEW"]}>
              <Link to="import">
                <Button type="primary" icon={<FileUp className="size-4" />}>
                  {t("common.import")}
                </Button>
              </Link>
            </PermissionCard>
          </>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <RestorableTable<BankOperationData>
          scrollStorageKey="bank-operation-list-scroll"
          restoreEnabled={false}
          restoreReady={!isLoading && Boolean(data)}
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={withRowNumbers(data?.items)}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 230px)" }}
          size="small"
        />
        <ListPagination {...paginationProps(data?.total)} />
      </Card>
    </div>
  );
}
