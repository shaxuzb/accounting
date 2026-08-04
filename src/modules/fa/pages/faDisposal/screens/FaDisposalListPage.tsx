import { Button, Space, Table } from "antd";
import type { TableColumnType, TableColumnsType } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import { endpoints } from "../constants/endpoints";
import { faDisposalPermissions } from "../constants/permissions";
import { useGetListFaDisposals } from "../hooks";
import type { FaDisposalResponse } from "../types/type";
import { ProcessStatusBadge } from "@/components/ui/status";
import { isFaDraftStatus } from "../../../shared/constants/statuses";

export default function FaDisposalListPage() {
  const { t } = useTranslation();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const canOpenDetail = permissions.includes(faDisposalPermissions.detail);
  const canUpdate = permissions.includes(faDisposalPermissions.update);
  const [searchParams] = useSearchParams();
  const { data, isLoading, isFetching, refetch } =
    useGetListFaDisposals(searchParams);

  const tableColumns: TableColumnsType<FaDisposalResponse> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 80,
    },
    {
      title: "ID",
      dataIndex: "id",
      render: (_, record) => {
        const isDraft = isFaDraftStatus(record);
        const path =
          isDraft && canUpdate
            ? `/main/fa/disposals/edit/${record.id}`
            : `/main/fa/disposals/${record.id}`;

        return canOpenDetail || (isDraft && canUpdate) ? (
          <Link to={path}>{record.id}</Link>
        ) : (
          <span>{record.id}</span>
        );
      },
      minWidth: 100,
    },
    {
      title: t("fa.fields.disposalDate"),
      dataIndex: "disposalDate",
      render: (value) => customDate(value),
      width: 180,
    },
    {
      title: t("fa.fields.disposalType"),
      dataIndex: "disposalTypeName",
      render: (_, record) =>
        record.disposalTypeName ?? record.disposalTypeId ?? "—",
      minWidth: 200,
    },
    {
      title: t("fa.fields.reason"),
      dataIndex: "reason",
      minWidth: 240,
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
    permissions.includes(faDisposalPermissions.update) ||
    permissions.includes(faDisposalPermissions.delete);

  const columns: TableColumnType<FaDisposalResponse>[] = hasActions
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
              customPath={`/main/fa/disposals/edit/${record.id}`}
              record={record}
              permissions={permissions}
              permissionsCode={{
                deleteCode: isDraft ? faDisposalPermissions.delete : "",
                editCode: isDraft ? faDisposalPermissions.update : "",
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
        <SearchFilter />
        <Space>
          <PermissionCard permission={faDisposalPermissions.create}>
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
        <Table<FaDisposalResponse>
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
