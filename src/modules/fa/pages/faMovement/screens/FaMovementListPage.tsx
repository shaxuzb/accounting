import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { customDate, generateKeyTable } from "@/utils/utils";
import { endpoints } from "../constants/endpoints";
import { faMovementPermissions } from "../constants/permissions";
import { useGetListFaMovements } from "../hooks";

import type { FaMovement } from "../types/type";
import { isFaDraftStatus } from "../../../shared/constants/statuses";

export default function FaMovementListPage() {
  const { t } = useTranslation();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListFaMovements(searchParams);
  const canOpenDetail = permissions.includes(faMovementPermissions.detail);

  const tableColumns: TableColumnsType<FaMovement> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      title: t("fa.fields.documentNumber"),
      dataIndex: "documentNumber",
      render: (_, record) =>
        canOpenDetail ? (
          <Link to={`${record.id}`}>
            {record.documentNumber ?? record.docNumber ?? record.id}
          </Link>
        ) : (
          <span>{record.documentNumber ?? record.docNumber ?? record.id}</span>
        ),
    },
    {
      title: t("fa.fields.documentDate"),
      dataIndex: "documentDate",
      render: (_, record) =>
        customDate(record.documentDate ?? record.docDate),
    },
    {
      title: t("fa.fields.comment"),
      dataIndex: "comment",
      render: (_, record) => record.comment ?? record.note ?? "-",
    },
    {
      dataIndex: "statusName",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId ?? record.stateId}
          statusName={record.statusName ?? record.stateName}
        />
      ),
    },
  ];

  const hasActions =
    permissions.includes(faMovementPermissions.update) ||
    permissions.includes(faMovementPermissions.delete);

  const columns: TableColumnType<FaMovement>[] = hasActions
    ? [
          ...tableColumns,
          {
            dataIndex: "actions",
            title: t("common.actions"),
            align: "center",
            fixed: "right",
            render: (_, record) => {
              const isDraft = isFaDraftStatus(record);

              return (
                <ActionColumn
                  deletePath={endpoints.list}
                  customPath={`/main/fa/movements/edit/${record.id}`}
                  record={record}
                  permissions={permissions}
                  permissionsCode={{
                    deleteCode: isDraft ? faMovementPermissions.delete : "",
                    editCode: isDraft ? faMovementPermissions.update : "",
                  }}
                  refetch={refetch}
                />
              );
            },
          },
      ]
    : tableColumns;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <PermissionCard permission={faMovementPermissions.create}>
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
        <Table<FaMovement>
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
