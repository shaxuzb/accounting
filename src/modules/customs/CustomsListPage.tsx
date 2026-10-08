import { Button, Table } from "antd";
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
import { money } from "@/modules/extraCosts/constants";
import { ExtraCostStatusTag } from "@/modules/extraCosts/ExtraCostListPage";
import { useCustomsDeclarations, type CustomsListItem } from "./api";
import { customsPath, customsPermissions } from "./constants";

/** Customs declarations of imports (1C «Таможенные декларации (импорт)»). */
export default function CustomsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data = [], isLoading, isFetching, refetch } = useCustomsDeclarations({
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
  });

  const columns: TableColumnsType<CustomsListItem> = [
    { dataIndex: "docNumber", title: "№", width: 90 },
    {
      dataIndex: "docDate",
      title: t("customs.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    { dataIndex: "declarationNumber", title: t("customs.declarationNumber"), render: (value?: string | null) => value || "-" },
    {
      dataIndex: "purchaseDocNumber",
      title: t("customs.purchase"),
      width: 120,
      render: (value?: string | null) => (value ? `№${value}` : "-"),
    },
    { dataIndex: "dutyAmount", title: t("customs.duty"), align: "right", render: (value: number) => money(value) },
    { dataIndex: "customsFee", title: t("customs.fee"), align: "right", render: (value: number) => money(value) },
    { dataIndex: "vatAmount", title: t("customs.vat"), align: "right", render: (value: number) => money(value) },
    { dataIndex: "finalAmount", title: t("customs.total"), align: "right", render: (value: number) => <b>{money(value)}</b> },
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
          <PermissionCard permission={customsPermissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${customsPath}/new`)}>
              {t("customs.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<CustomsListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${customsPath}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
