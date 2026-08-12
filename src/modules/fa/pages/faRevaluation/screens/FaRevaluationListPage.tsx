import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { endpoints } from "../constants/endpoints";
import { faRevaluationPermissions } from "../constants/permissions";
import { useGetListFaRevaluations } from "../hooks";
import type { FaRevaluation } from "../types/type";
import { isFaDraftStatus } from "../../../shared/constants/statuses";
import FaListFilters from "../../../shared/components/FaListFilters";
import FaListPagination from "../../../shared/components/FaListPagination";

export default function FaRevaluationListPage() {
  const { t } = useTranslation();
  const permissions = useAppSelector((state) => state.auth.user?.user.permissions ?? []);
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } = useGetListFaRevaluations(
    searchParams,
  );

  const tableColumns: TableColumnsType<FaRevaluation> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 80,
    },
    {
      title: t("fa.fields.documentNumber"),
      dataIndex: "documentNumber",
      render: (_, record) => (
        <Link to={`${record.id}`}>
          {record.documentNumber ?? record.id}
        </Link>
      ),
      minWidth: 180,
    },
    {
      title: t("fa.fields.documentDate"),
      dataIndex: "documentDate",
      render: (value) => customDate(value),
      width: 180,
    },
    {
      title: t("fa.fields.comment"),
      dataIndex: "comment",
      minWidth: 240,
    },
    {
      dataIndex: "statusName",
      title: t("settings.fields.status"),
      align: "center",
      width: 130,
      render: (_, record) => <ProcessStatusBadge statusId={record.statusId} statusName={record.statusName} />,
    },
  ];

  const hasActions = permissions.includes(faRevaluationPermissions.update);

  const columns: TableColumnType<FaRevaluation>[] = hasActions
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
              customPath={`/main/fa/revaluations/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                editCode: isDraft ? faRevaluationPermissions.update : "",
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
        <div className="flex flex-wrap items-center gap-2"><FaListFilters /></div>
        <Space>
          <PermissionCard permission={faRevaluationPermissions.create}>
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
        <Table<FaRevaluation>
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
