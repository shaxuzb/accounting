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
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useGetListPurchase } from "../hooks/useGetListPurchase";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import { purchaseEndpoints } from "../constants/endpoints";
import SearchFilter from "@/components/ui/filters/SearchFilter";

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
    },
    {
      dataIndex: "docNumber",
      title: t("purchase.fields.docNumber"),
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "accountingEntriesReport",
      title: "Provodka",
      align: "center",
      render: (_, record) => (
        <Link to={`/main/accountingentriesreport?documentId=${record.id}`}>
          <Button icon={<ReceiptText className="size-4" />} />
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("purchase.fields.docDate"),
      render: (value) => formatDate(value),
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
    userPermissions.includes(purchasePermissions.update) ||
    userPermissions.includes(purchasePermissions.delete);

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
                customPath={`/main/purchases/purchase/edit/${record.id}`}
                record={record}
                permissions={user?.user.permissions}
                permissionsCode={{
                  editCode:
                    record.statusId === 1 ? purchasePermissions.update : "",
                  deleteCode:
                    record.statusId === 1 ? purchasePermissions.delete : "",
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <SearchFilter />
        </div>
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
