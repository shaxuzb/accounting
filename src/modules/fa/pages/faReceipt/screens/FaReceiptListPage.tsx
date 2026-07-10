import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Plus, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, customDate } from "@/utils/utils";
import { endpoints } from "../constants/endpoints";
import { faReceiptPermissions } from "../constants/permissions";
import { useGetListFaReceipts } from "../hooks";
import { stateStatus } from "@/utils/helpers/statusHelper";
import type { FaReceiptRecord } from "../types/type";

export default function FaReceiptListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const permissions = user?.user.permissions ?? [];
  const { data, isLoading, isFetching, refetch } = useGetListFaReceipts(
    searchParams,
  );

  const tableColumns: TableColumnsType<FaReceiptRecord> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 80,
    },
    {
      dataIndex: "documentNumber",
      title: t("fa.fields.documentNumber"),
      render: (_, record) => <Link to={`${record.id}`}>{record.documentNumber}</Link>,
      minWidth: 180,
    },
    {
      dataIndex: "documentDate",
      title: t("fa.fields.documentDate"),
      render: (value) => customDate(value),
      width: 180,
    },
    {
      dataIndex: "comment",
      title: t("fa.fields.comment"),
    },
    {
      dataIndex: "stateName",
      title: t("fa.fields.state"),
      align: "center",
      width: 130,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
  ];

  const columns: TableColumnType<FaReceiptRecord>[] =
    permissions.includes(faReceiptPermissions.delete) ||
    permissions.includes(faReceiptPermissions.update)
      ? [
          ...tableColumns,
          {
            dataIndex: "actions",
            title: t("common.actions"),
            align: "center",
            width: 100,
            fixed: "right",
            render: (_, record) => (
              <ActionColumn
                deletePath={endpoints.list}
                customPath={`/main/fa/receipts/edit/${record.id}`}
                record={record}
                permissions={permissions}
                permissionsCode={{
                  deleteCode: faReceiptPermissions.delete,
                  editCode: faReceiptPermissions.update,
                }}
                refetch={refetch}
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
          <PermissionCard permission={faReceiptPermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("common.add")}
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
        <Table<FaReceiptRecord>
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

