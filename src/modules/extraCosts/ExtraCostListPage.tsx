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
import { useExtraCosts, type ExtraCostListItem } from "./api";
import { extraCostPath, extraCostPermissions, extraCostStatus, money } from "./constants";

export const ExtraCostStatusTag = ({ statusId }: { statusId: number }) => {
  const { t } = useTranslation();
  return statusId === extraCostStatus.posted ? (
    <Tag color="green">{t("currency.status.posted")}</Tag>
  ) : statusId === extraCostStatus.cancelled ? (
    <Tag color="red">{t("currency.status.cancelled")}</Tag>
  ) : (
    <Tag>{t("currency.status.draft")}</Tag>
  );
};

/** The additional costs of purchases (1C «Поступления доп. расходов»). */
export default function ExtraCostListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data = [], isLoading, isFetching, refetch } = useExtraCosts({
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
  });

  const columns: TableColumnsType<ExtraCostListItem> = [
    { dataIndex: "docNumber", title: "№", width: 100 },
    {
      dataIndex: "docDate",
      title: t("extraCost.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      dataIndex: "purchaseDocNumber",
      title: t("extraCost.purchase"),
      width: 140,
      render: (value?: string | null) => (value ? `№${value}` : "-"),
    },
    { dataIndex: "counterpartyName", title: t("extraCost.counterparty") },
    { dataIndex: "content", title: t("extraCost.content") },
    {
      dataIndex: "finalAmount",
      title: t("extraCost.total"),
      align: "right",
      render: (value: number) => money(value),
    },
    {
      dataIndex: "statusId",
      title: t("currency.status.title"),
      align: "center",
      render: (value: number) => <ExtraCostStatusTag statusId={value} />,
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
          <PermissionCard permission={extraCostPermissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${extraCostPath}/new`)}>
              {t("extraCost.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<ExtraCostListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${extraCostPath}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
