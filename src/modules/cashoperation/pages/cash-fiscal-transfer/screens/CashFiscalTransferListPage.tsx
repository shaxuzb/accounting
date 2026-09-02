import { Button, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useGetCashFiscalTransfers } from "../hooks";
import { cashFiscalTransferPermissions } from "../constants/permissions";
import type { CashFiscalTransfer } from "../types/type";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { directionLabelKey } from "@/components/fields/directionOptions";

export default function CashFiscalTransferListPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } =
    useGetCashFiscalTransfers(params);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );

  const columns: TableColumnsType<CashFiscalTransfer> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => {
        const label = value ?? record.id;

        return (
          <Link
            to={record.statusId === 1 ? `${record.id}/edit` : `${record.id}`}
          >
            {label}
          </Link>
        );
      },
    },
    {
      dataIndex: "docDate",
      title: t("bank.fields.date"),
      render: (value) => customDate(value),
    },
    {
      dataIndex: "fiscalCashRegisterName",
      title: t("settings.entities.fiscalCashRegisters"),
      render: (_, record) =>
        record.fiscalCashRegisterName ?? record.fiscalCashRegisterId,
    },
    {
      dataIndex: "directionName",
      title: t("cash.fields.direction"),
      render: (_, record) =>
        record.directionName ?? t(directionLabelKey(record.directionId)),
    },
    {
      dataIndex: "amount",
      title: t("bank.fields.amount"),
      align: "center",
      render: (value, record) =>
        `${numberSpacing(value)} ${record.currencyName ?? ""}`,
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

  if (
    permissions.includes(cashFiscalTransferPermissions.update) ||
    permissions.includes(cashFiscalTransferPermissions.delete)
  ) {
    columns.push({
      dataIndex: "actions",
      title: t("common.actions"),
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <ActionColumn
          deletePath="cash-fiscal-transfers"
          customPath={`${record.id}/edit`}
          record={record}
          permissions={permissions}
          permissionsCode={{
            editCode:
              record.statusId === 1 ? cashFiscalTransferPermissions.update : "",
            deleteCode:
              record.statusId === 1 ? cashFiscalTransferPermissions.delete : "",
          }}
          refetch={() => void refetch()}
        />
      ),
    });
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <Button
            icon={<RefreshCw className="size-4" />}
            onClick={() => void refetch()}
          />
          <PermissionCard permission={cashFiscalTransferPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("add")}
            >
              {t("cash.fiscalTransfer.create")}
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<CashFiscalTransfer>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 220px)" }}
        />
      </Card>
    </div>
  );
}
