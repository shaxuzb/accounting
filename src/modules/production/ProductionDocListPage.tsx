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
import { useProductionDocs, type ProductionDocListItem } from "./api";
import { money, productionDocs, productionStatus, type ProductionDocKind } from "./constants";

export const ProductionStatusTag = ({ statusId }: { statusId: number }) => {
  const { t } = useTranslation();
  return statusId === productionStatus.posted ? (
    <Tag color="green">{t("currency.status.posted")}</Tag>
  ) : statusId === productionStatus.cancelled ? (
    <Tag color="red">{t("currency.status.cancelled")}</Tag>
  ) : (
    <Tag>{t("currency.status.draft")}</Tag>
  );
};

/** The material requisitions or the production reports (1C «Требования-накладные», «Отчеты производства за смену»). */
export default function ProductionDocListPage({ kind }: { kind: ProductionDocKind }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doc = productionDocs[kind];
  const { data = [], isLoading, isFetching, refetch } = useProductionDocs(kind, {
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
  });

  const columns: TableColumnsType<ProductionDocListItem> = [
    { dataIndex: "docNumber", title: "№", width: 100 },
    {
      dataIndex: "docDate",
      title: t("production.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    { dataIndex: "warehouseName", title: t("production.warehouse") },
    {
      dataIndex: "costAccountNumber",
      title: t(kind === "requisition" ? "production.costAccount" : "production.productionAccount"),
      width: 130,
      render: (value?: string | null) => value || "-",
    },
    {
      dataIndex: "productGroupName",
      title: t("production.productGroup"),
      render: (value?: string | null) => value || "-",
    },
    {
      dataIndex: "amount",
      title: t(kind === "requisition" ? "production.costAmount" : "production.plannedAmount"),
      align: "right",
      render: (value: number) => money(value),
    },
    { dataIndex: "comment", title: t("production.comment") },
    {
      dataIndex: "statusId",
      title: t("currency.status.title"),
      align: "center",
      render: (value: number) => <ProductionStatusTag statusId={value} />,
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
          <PermissionCard permission={doc.permissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${doc.path}/new`)}>
              {t(doc.newKey)}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<ProductionDocListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${doc.path}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
