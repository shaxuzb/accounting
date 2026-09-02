import { Button, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useGetPaymentAcceptancePointOperations } from "../hooks";
import { paymentAcceptancePointOperationPermissions } from "../constants/permissions";
import type { PaymentAcceptancePointOperation } from "../types/type";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { useAppSelector } from "@/store/hooks";
import { directionLabelKey } from "@/components/fields/directionOptions";

export default function PaymentAcceptancePointOperationListPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } =
    useGetPaymentAcceptancePointOperations(params);
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );

  const columns: TableColumnsType<PaymentAcceptancePointOperation> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), align: "center" },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => {
        const label = value ?? record.id;

        return (
          <Link to={record.statusId === 1 ? `${record.id}/edit` : `${record.id}`}>
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
      dataIndex: "paymentAcceptancePointName",
      title: t("app.menu.paymentAcceptancePoints"),
      render: (_, record) =>
        record.paymentAcceptancePointName ?? record.paymentAcceptancePointId,
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
        `${numberSpacing(value)} ${record.currencyCode ?? ""}`,
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
    permissions.includes(paymentAcceptancePointOperationPermissions.update) ||
    permissions.includes(paymentAcceptancePointOperationPermissions.delete)
  ) {
    columns.push({
      dataIndex: "actions",
      title: t("common.actions"),
      fixed: "right",
      render: (_, record) => (
        <ActionColumn
          deletePath="payment-acceptance-point-operations"
          record={record}
          permissions={permissions}
          permissionsCode={{
            editCode:
              record.statusId === 1
                ? paymentAcceptancePointOperationPermissions.update
                : "",
            deleteCode:
              record.statusId === 1
                ? paymentAcceptancePointOperationPermissions.delete
                : "",
          }}
          refetch={() => void refetch()}
          customPath={`${record.id}/edit`}
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
          <PermissionCard
            permission={paymentAcceptancePointOperationPermissions.create}
          >
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("add")}
            >
              {t("cash.paymentAcceptancePointOperation.create")}
            </Button>
          </PermissionCard>
        </Space>
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<PaymentAcceptancePointOperation>
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
