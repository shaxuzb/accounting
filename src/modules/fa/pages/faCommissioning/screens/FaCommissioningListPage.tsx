import { Button, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Link, useSearchParams } from "react-router";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate, generateKeyTable } from "@/utils/utils";
import FaListFilters from "../../../shared/components/FaListFilters";
import FaListPagination from "../../../shared/components/FaListPagination";
import { isFaDraftStatus } from "../../../shared/constants/statuses";
import { faCommissioningPermissions } from "../constants/permissions";
import { useGetListFaCommissionings } from "../hooks";
import type { FaCommissioning } from "../types/type";

export default function FaCommissioningListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const permissions = useAppSelector(
    (state) => state.auth.user?.user.permissions ?? [],
  );
  const { data, isLoading, isFetching, refetch } =
    useGetListFaCommissionings(searchParams);
  const columns: TableColumnsType<FaCommissioning> = [
    {
      title: t("common.rowNumber"),
      dataIndex: "indexId",
      width: 80,
      align: "center",
    },
    {
      title: t("fa.fields.documentNumber"),
      dataIndex: "documentNumber",
      minWidth: 170,
      render: (value, record) => (
        <Link to={`${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      title: t("fa.fields.documentDate"),
      dataIndex: "documentDate",
      width: 160,
      render: (_, record) => customDate(record.documentDate ?? record.docDate),
    },
    { title: t("fa.fields.note"), dataIndex: "note" },
    {
      title: t("fa.commissioning.assetCount"),
      dataIndex: "lines",
      align: "center",
      width: 130,
      render: (lines) => lines?.length ?? 0,
    },
    {
      title: t("settings.fields.status"),
      dataIndex: "statusName",
      align: "center",
      width: 150,
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
    },
    {
      title: t("common.actions"),
      dataIndex: "actions",
      align: "center",
      width: 100,
      render: (_, record) =>
        isFaDraftStatus(record) &&
        permissions.includes(faCommissioningPermissions.update) ? (
          <Link to={`edit/${record.id}`}>
            <Button type="link">{t("common.edit")}</Button>
          </Link>
        ) : null,
    },
  ];
  return (
    <div className="w-full">
      <ListToolbar
        filters={<FaListFilters />}
        actions={
          <PermissionCard permission={faCommissioningPermissions.create}>
            <Link to="add">
              <Button type="primary" icon={<Plus className="size-4" />}>
                {t("common.add")}
              </Button>
            </Link>
          </PermissionCard>
        }
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />
      <Card className="overflow-hidden border border-border">
        <Table
          columns={columns}
          dataSource={generateKeyTable(data?.items ?? [], "id")}
          loading={isLoading || isFetching}
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
