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
import { CorrectionStatusTag } from "@/modules/corrections/CorrectionListPage";
import { money } from "@/modules/corrections/constants";
import { useFaModernizations, type FaModernizationListItem } from "./api";
import { faModernizationPath, faModernizationPermissions } from "./constants/permissions";

/** Modernizations of fixed assets (1C «Модернизация ОС»). */
export default function FaModernizationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data = [], isLoading, isFetching, refetch } = useFaModernizations({
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  });

  const columns: TableColumnsType<FaModernizationListItem> = [
    { dataIndex: "docNumber", title: "№", width: 90 },
    {
      dataIndex: "docDate",
      title: t("fa.modernization.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    { dataIndex: "assetCount", title: t("fa.modernization.assetCount"), align: "right", width: 110 },
    {
      dataIndex: "amount",
      title: t("fa.modernization.amount"),
      align: "right",
      width: 170,
      render: (value: number) => money(value),
    },
    { dataIndex: "comment", title: t("fa.modernization.comment") },
    {
      dataIndex: "statusId",
      title: t("currency.status.title"),
      align: "center",
      width: 130,
      render: (value: number) => <CorrectionStatusTag statusId={value} />,
    },
  ];

  return (
    <div className="w-full">
      <ListToolbar
        filters={<DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />}
        actions={
          <PermissionCard permission={faModernizationPermissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${faModernizationPath}/new`)}>
              {t("fa.modernization.new")}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<FaModernizationListItem>
          rowKey="id"
          size="middle"
          loading={isLoading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 50, showSizeChanger: false }}
          onRow={(record) => ({
            className: "cursor-pointer",
            onClick: () => navigate(`${faModernizationPath}/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}
