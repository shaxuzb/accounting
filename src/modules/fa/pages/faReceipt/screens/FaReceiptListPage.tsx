import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Plus, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import { generateKeyTable, customDate } from "@/utils/utils";
import { endpoints } from "../constants/endpoints";
import { faReceiptPermissions } from "../constants/permissions";
import { useGetListFaReceipts } from "../hooks";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import type { FaReceiptResponse } from "../types/type";
import { isFaDraftStatus } from "../../../shared/constants/statuses";
import FaListFilters from "../../../shared/components/FaListFilters";
import FaListPagination from "../../../shared/components/FaListPagination";

export default function FaReceiptListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const permissions = user?.user.permissions ?? [];
  const { data, isLoading, isFetching, refetch } =
    useGetListFaReceipts(searchParams);

  const tableColumns: TableColumnsType<FaReceiptResponse> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 80,
    },
    {
      dataIndex: "documentNumber",
      title: t("fa.fields.documentNumber"),
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
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
      dataIndex: "statusName",
      title: t("settings.fields.status"),
      align: "center",
      width: 130,
      render: (_, record) => <ProcessStatusBadge statusId={record.statusId} statusName={record.statusName} />,
    },
  ];

  const columns: TableColumnType<FaReceiptResponse>[] =
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
            render: (_, record) => {
              const isDraft = isFaDraftStatus(record);

              return <ActionColumn
                deletePath={endpoints.list}
                customPath={`/main/fa/receipts/edit/${record.id}`}
                record={record}
                permissions={permissions}
                permissionsCode={{
                  deleteCode: isDraft ? faReceiptPermissions.delete : "",
                  editCode: isDraft ? faReceiptPermissions.update : "",
                }}
                refetch={refetch}
              />;
            },
          },
        ]
      : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FaListFilters>
            <SelectFilter paramKey="counterpartyId" placeholder="fa.fields.counterpartyId" path={selectListEndpoints.counterpartiesSelectList} width={190} search />
            <SelectFilter paramKey="receiptTypeId" placeholder="fa.fields.receiptType" path={selectListEndpoints.faReceiptTypesSelectList} width={170} />
          </FaListFilters>
        </div>
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
        <Table
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
        <FaListPagination total={data?.totalCount ?? data?.total} page={data?.page} pageSize={data?.pageSize} />
      </Card>
    </div>
  );
}
