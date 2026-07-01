import { Link, useSearchParams } from "react-router";
import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { FileUp, ReceiptText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { useAppSelector } from "@/store/hooks";
import { formatDate, generateKeyTable } from "@/utils/utils";
import type { PurchaseData } from "@/modules/purchase/pages/purchase/types/type";
import { purchasePermissions } from "@/modules/purchase/pages/purchase/constants/permissions";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { useGetListPurchase } from "../hooks/useGetListPurchase";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { purchaseEndpoints } from "../constants/endpoints";

export default function PurchaseListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const userPermissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetListPurchase(searchParams);

  const tableColumns: TableColumnsType<PurchaseData> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 10
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      width: 130,
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: "Provodka",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Link to={`/main/accountingentriesreport?documentId=${record.id}`}>
          <Button icon={<ReceiptText className="size-4" />} />
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("purchase.fields.docDate"),
      width: 100,
      render: (value) => formatDate(value),
      align: "center",
    },
    {
      dataIndex: "counterpartyName",
      title: t("purchase.fields.supplier"),
      align: "center",
    },
    {
      dataIndex: "warehouseName",
      title: t("purchase.fields.warehouse"),
      align: "center",
    },
    {
      dataIndex: "statusId",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const hasActions = userPermissions.includes(purchasePermissions.delete);

  const columns: TableColumnType<PurchaseData>[] = hasActions
    ? [
        ...tableColumns,
        {
          dataIndex: "actions",
          title: t("common.actions"),
          align: "center",
          width: 90,
          fixed: "right",
          render: (_, record) => (
            <div>
              <ActionColumn
                deletePath={purchaseEndpoints.purchase.list}
                customPath={`/main/settings/contracts/edit/${record.id}`}
                record={record}
                permissions={user?.user.permissions}
                permissionsCode={{
                  deleteCode: purchasePermissions.delete,
                }}
                refetch={refetch}
              />
            </div>
          ),
        },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-end">
        <Space>
          <PermissionCard permission={purchasePermissions.create}>
            <Link to="import">
              <Button type="primary" icon={<FileUp className="size-4" />}>
                {t("purchase.importTitle")}
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
        <Table<PurchaseData>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [])}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
      </Card>
    </div>
  );
}
