import { Button, Space, Table } from "antd";
import type { TableColumnsType, TableColumnType } from "antd";
import { Link, useSearchParams } from "react-router";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ActionColumn from "@/components/ui/table/actions/ActionColumns";
import Card from "@/components/ui/card/Card";
import { useAppSelector } from "@/store/hooks";
import { generateKeyTable} from "@/utils/utils";
import { stateStatus } from "@/utils/helpers/statusHelper";
import { endpoints } from "../constants/endpoints";
import { faAssetPermissions } from "../constants/permissions";
import { useGetListFaAssets } from "../hooks";
import type { FaAssetValues } from "../types/type";

export default function FaAssetListPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams] = useSearchParams();

  const { data, isLoading, isFetching, refetch } = useGetListFaAssets(searchParams);
  const permissions = user?.user.permissions ?? [];

  const tableColumns: TableColumnsType<FaAssetValues> = [
    {
      dataIndex: "indexId",
      title: t("common.rowNumber"),
      align: "center",
      width: 70,
    },
    {
      title: t("fa.fields.inventoryNumber"),
      dataIndex: "inventoryNumber",
      minWidth: 150,
      render: (_, record) => (
        <Link to={`${record.id}`}>{record.inventoryNumber ?? record.id}</Link>
      ),
    },
    {
      title: t("fa.fields.name"),
      dataIndex: "name",
      minWidth: 220,
    },
    {
      title: t("fa.fields.faGroup"),
      dataIndex: "faGroupName",
      minWidth: 180,
    },
    {
      title: t("fa.fields.okof"),
      dataIndex: "okofName",
      minWidth: 180,
    },
    {
      title: t("fa.fields.initialCost"),
      dataIndex: "initialCost",
      align: "right",
      minWidth: 140,
      render: (value) => value ?? "-",
    },
    {
      title: t("fa.fields.state"),
      dataIndex: "stateName",
      align: "center",
      width: 120,
      render: (_, record) => stateStatus(record.stateId, record.stateName),
    },
    // {
    //   title: t("settings.fields.createdDate"),
    //   dataIndex: "createdDate",
    //   align: "center",
    //   width: 170,
    //   render: (_, record) => <span>{customDate(record.createdDate)}</span>,
    // },
  ];

  const columns: TableColumnType<FaAssetValues>[] =
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <SearchFilter />
        <Space>
          <PermissionCard permission={faAssetPermissions.create}>
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
        <Table<FaAssetValues>
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

