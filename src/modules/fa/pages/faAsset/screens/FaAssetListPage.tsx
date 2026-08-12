import { Table } from "antd";
import type { TableColumnsType, TableColumnType } from "antd";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable, numberSpacing } from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { endpoints } from "../constants/endpoints";
import { faAssetPermissions } from "../constants/permissions";
import FaListFilters, { FaGroupFilter } from "../../../shared/components/FaListFilters";
import FaListPagination from "../../../shared/components/FaListPagination";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import { useGetListFaAssets } from "../hooks";
import type { FaAsset } from "../types/type";

export default function FaAssetListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  const { data, isLoading, isFetching, refetch } =
    useGetListFaAssets(searchParams);
  const permissions = user?.user.permissions ?? [];
  const canOpenDetail = permissions.includes(faAssetPermissions.detail);

  const tableColumns: TableColumnsType<FaAsset> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
    },
    {
      title: t("fa.fields.inventoryNumber"),
      dataIndex: "inventoryNumber",
      render: (_, record) =>
        canOpenDetail ? (
          <Link to={`${record.id}`}>{record.inventoryNumber ?? record.id}</Link>
        ) : (
          <span>{record.inventoryNumber ?? record.id}</span>
        ),
    },
    {
      title: t("fa.fields.name"),
      dataIndex: "name",
    },
    {
      title: t("fa.fields.faGroup"),
      dataIndex: "faGroupName",
      align: "center",
    },
    {
      title: t("fa.fields.commissioningDate"),
      dataIndex: "commissioningDate",
      align: "center",
      render: (value) => (value ? customDate(value) : "-"),
    },
    {
      title: t("fa.fields.initialCost"),
      dataIndex: "initialCost",
      align: "center",
      render: (value) => (value == null ? "-" : numberSpacing(value)),
    },
    {
      title: t("fa.fields.state"),
      dataIndex: "stateName",
      align: "center",
      render: (_, record) => stateStatus(record.stateId, record.stateName),
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

  const columns: TableColumnType<FaAsset>[] =
    permissions.includes(faAssetPermissions.delete) ||
    permissions.includes(faAssetPermissions.update)
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
                  customPath={`/main/fa/assets/edit/${record.id}`}
                  record={record}
                  permissions={permissions}
                  permissionsCode={{
                    deleteCode: faAssetPermissions.delete,
                    editCode: faAssetPermissions.update,
                  }}
                  refetch={refetch}
                />
              ),
          },
        ]
      : tableColumns;

  return (
    <div className="w-full">
      <ListToolbar
        filters={<FaListFilters statusKind="asset" dateParamKeys={null}><FaGroupFilter /></FaListFilters>}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />

      <Card className="overflow-hidden border border-border">
        <Table<FaAsset>
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 180px)" }}
        />
        <FaListPagination
          total={data?.totalCount ?? data?.total}
          page={data?.page}
          pageSize={data?.pageSize}
        />
      </Card>
    </div>
  );
}
