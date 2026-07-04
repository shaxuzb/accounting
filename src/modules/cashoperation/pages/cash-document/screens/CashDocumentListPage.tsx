import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router";
import PermissionCard from "@/components/ui/card/PermissionCard";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { cashDocumentPermissions } from "../constants/permissions";
import { useGetCashDocuments } from "../hooks";
import type { CashDocument } from "../types/type";
import { getCashDocumentLabels, resolveCashDocumentKind } from "../utils/kind";

export default function CashDocumentListPage() {
  const { t } = useTranslation();
  const { kind: rawKind } = useParams();
  const kind = resolveCashDocumentKind(rawKind);
  const labels = getCashDocumentLabels(kind);
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } = useGetCashDocuments(
    kind,
    searchParams,
  );

  const columns: TableColumnsType<CashDocument> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => (
        <Link
          to={`/main/cash-operationses/cash-documents/${kind}/${record.id}`}
        >
          {value ?? record.id}
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "cashBoxName",
      title: "Kassa",
      render: (_, record) => record.cashBoxName ?? record.cashBoxId,
    },
    {
      dataIndex: "counterpartyName",
      title: t("bank.fields.counterparty"),
      render: (_, record) =>
        record.counterpartyName ?? record.counterpartyId ?? "-",
    },
    {
      dataIndex: "paymentPurposeName",
      title: "To'lov maqsadi",
      render: (_, record) =>
        record.paymentPurposeName ?? record.paymentPurposeId ?? "-",
    },
    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "center",
      render: (value) => `${numberSpacing(value)} UZS`,
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
    permissions.includes(cashDocumentPermissions.update) ||
    permissions.includes(cashDocumentPermissions.delete);

  const tableColumns: TableColumnType<CashDocument>[] = hasActions
    ? [
        ...columns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          fixed: "right",
          render: (_, record) => (
            <ActionColumn
              deletePath={`cash-documents/${kind}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode:
                  record.statusId === 1 ? cashDocumentPermissions.delete : "",
                editCode:
                  record.statusId === 1 ? cashDocumentPermissions.update : "",
              }}
              refetch={() => refetch()}
              customPath={`/main/cash-operationses/cash-documents/${kind}/${record.id}`}
            />
          ),
        },
      ]
    : columns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        {/* <div className="text-lg font-semibold">{labels.listTitle}</div> */}
        <SearchFilter />
        <Space>
          <PermissionCard permission={cashDocumentPermissions.create}>
            <Link to={`/main/cash-operationses/cash-documents/${kind}/add`}>
              <Button type="primary" icon={<Plus className="size-4" />}>
                {labels.addTitle}
              </Button>
            </Link>
          </PermissionCard>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
        </Space>
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<CashDocument>
          loading={isLoading || isFetching}
          columns={tableColumns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 220px)" }}
        />
      </Card>
    </div>
  );
}
