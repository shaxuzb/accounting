import { Table, Tag } from "antd";
import type { TableColumnsType, TableColumnType } from "antd";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
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
import { faAssetKindLabels, faAssetKinds } from "../../../shared/constants/assetKinds";

const assetStatusTags: Record<number, { label: string; color: string }> = {
  1: { label: "fa.assetStatuses.notCommissioned", color: "default" },
  2: { label: "fa.assetStatuses.active", color: "green" },
  3: { label: "fa.assetStatuses.conservation", color: "orange" },
  4: { label: "fa.assetStatuses.disposed", color: "red" },
};

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
      dataIndex: "assetKindId",
      title: t("fa.kinds.title"),
      width: 170,
      render: (value: number | undefined) => t(faAssetKindLabels[value ?? faAssetKinds.fixed]),
    },
    {
      dataIndex: "statusName",
      title: t("settings.fields.status"),
      align: "center",
      width: 230,
      // the asset's own status (not a document's): not in use, in use, conserved, disposed
      render: (_, record) => {
        const status = assetStatusTags[record.statusId];
        return status ? <Tag color={status.color}>{t(status.label)}</Tag> : record.statusName;
      },
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
        filters={<FaListFilters statusKind="asset" assetKind dateParamKeys={null}><FaGroupFilter /></FaListFilters>}
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
