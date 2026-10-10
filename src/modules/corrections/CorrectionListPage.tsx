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
import { useCorrections, type CorrectionListItem } from "./api";
import {
  correctionPermissions,
  correctionReason,
  corrections,
  correctionStatus,
  money,
  type CorrectionKind,
} from "./constants";

export const CorrectionStatusTag = ({ statusId }: { statusId: number }) => {
  const { t } = useTranslation();
  return statusId === correctionStatus.posted ? (
    <Tag color="green">{t("currency.status.posted")}</Tag>
  ) : statusId === correctionStatus.cancelled ? (
    <Tag color="red">{t("currency.status.cancelled")}</Tag>
  ) : (
    <Tag>{t("currency.status.draft")}</Tag>
  );
};

/** The corrections of posted sales or purchases (1C «Корректировки реализации / поступления»). */
export default function CorrectionListPage({ kind }: { kind: CorrectionKind }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doc = corrections[kind];
  const { data = [], isLoading, isFetching, refetch } = useCorrections(kind, {
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    search: searchParams.get("search") || undefined,
  });

  const columns: TableColumnsType<CorrectionListItem> = [
    { dataIndex: "docNumber", title: "№", width: 90 },
    {
      dataIndex: "docDate",
      title: t("correction.date"),
      width: 150,
      render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm"),
    },
    {
      dataIndex: "baseDocNumber",
      title: t(kind === "sale" ? "correction.baseSale" : "correction.basePurchase"),
      width: 130,
      render: (value?: string | null) => (value ? `№${value}` : "-"),
    },
    { dataIndex: "counterpartyName", title: t("correction.counterparty") },
    ...(kind === "sale"
      ? [
          {
            dataIndex: "reason",
            title: t("correction.reason"),
            width: 170,
            render: (value: number) =>
              t(value === correctionReason.discount ? "correction.reasons.discount" : "correction.reasons.price"),
          },
        ]
      : []),
    {
      dataIndex: "totalDelta",
      title: t("correction.totalDelta"),
      align: "right",
      width: 160,
      render: (value: number) => <span className={value < 0 ? "text-red-600" : ""}>{money(value)}</span>,
    },
    { dataIndex: "comment", title: t("correction.comment") },
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
        filters={
          <>
            <SearchFilter />
            <DateRangeFilter placeholderKeys={["currency.dateFrom", "currency.dateTo"]} />
          </>
        }
        actions={
          <PermissionCard permission={correctionPermissions.create}>
            <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${doc.path}/new`)}>
              {t(doc.newKey)}
            </Button>
          </PermissionCard>
        }
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />
      <Card className="overflow-hidden border border-border">
        <Table<CorrectionListItem>
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
