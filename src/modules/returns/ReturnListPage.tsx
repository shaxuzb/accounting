import { Button, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import ListToolbar from "@/components/ui/filters/ListToolbar";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import { useReturns, type ReturnListItem } from "./api";
import {
  returnPaths,
  returnPermissions,
  returnStatus,
  returnKind,
  type ReturnKind,
} from "./constants";

const money = (value: number) =>
  value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ReturnStatusTag = ({ statusId }: { statusId: number }) => {
  const { t } = useTranslation();
  return statusId === returnStatus.posted ? (
    <Tag color="green">{t("currency.status.posted")}</Tag>
  ) : statusId === returnStatus.cancelled ? (
    <Tag color="red">{t("currency.status.cancelled")}</Tag>
  ) : (
    <Tag>{t("currency.status.draft")}</Tag>
  );
};

/** Returns of one kind (1C «Возвраты товаров …»), each on the basis of the document the goods came by. */
export default function ReturnListPage({ kind }: { kind: ReturnKind }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const path = returnPaths[kind];
  const { data = [], isLoading, isFetching, refetch } = useReturns({
    kind,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
  });

  const columns: TableColumnsType<ReturnListItem> = [
    { dataIndex: "docNumber", title: "№", width: 100 },
    {
      dataIndex: "docDate",
      title: t("returnDoc.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      dataIndex: "baseDocNumber",
      title: t("returnDoc.baseDocument"),
      width: 140,
      render: (value?: string | null) => (value ? `№${value}` : "-"),
    },
    ...(kind === returnKind.fromRetail
      ? []
      : [{ dataIndex: "counterpartyName", title: t("returnDoc.counterparty") }]),
    { dataIndex: "warehouseName", title: t("returnDoc.warehouse") },
    {
      dataIndex: "finalAmount",
      title: t("returnDoc.total"),
      align: "right",
      render: (value: number) => money(value),
    },
    {
      dataIndex: "statusId",
      title: t("currency.status.title"),
      align: "center",
      render: (value: number) => <ReturnStatusTag statusId={value} />,
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={
          <>
            <SearchFilter />
            <DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />
          </>
        }
        actions={
          <PermissionCard permission={returnPermissions.create}>
            <Button
              type="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate(`${path}/new`)}
            >
              {t("returnDoc.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<ReturnListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${path}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
