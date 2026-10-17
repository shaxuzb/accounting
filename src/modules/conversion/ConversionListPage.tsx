import { useState } from "react";
import { Button, DatePicker, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import {
  conversionJournals,
  conversionPermissions,
  money,
  useConversions,
  type ConversionJournal,
  type ConversionListItem,
} from "./api";

const statusColors: Record<number, string> = { 1: "blue", 2: "green", 3: "red" };

export function ConversionStatusTag({ statusId }: { statusId: number }) {
  const { t } = useTranslation();
  return <Tag color={statusColors[statusId] ?? "default"}>{t(`conversion.status.${statusId}`)}</Tag>;
}

/** The journal of one kind of conversion: assemblies and disassemblies, re-gradings, transfers between accounts. */
export default function ConversionListPage({ journal }: { journal: ConversionJournal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = conversionJournals[journal];
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { data = [], isFetching } = useConversions(journal, {
    dateFrom: range?.[0].format("YYYY-MM-DD"),
    dateTo: range?.[1].format("YYYY-MM-DD"),
  });

  const columns: TableColumnsType<ConversionListItem> = [
    { dataIndex: "docNumber", title: "№", width: 80, render: (value: string) => <b>{value}</b> },
    { dataIndex: "docDate", title: t("conversion.date"), width: 150, render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm") },
    ...(journal === "assembly"
      ? [{ dataIndex: "kind", title: t("conversion.kind"), width: 170, render: (value: number) => t(`conversion.kinds.${value}`) }]
      : []),
    { dataIndex: "warehouseName", title: t("conversion.warehouse") },
    { dataIndex: "summary", title: t("conversion.summary") },
    { dataIndex: "amount", title: t("conversion.amount"), align: "right", render: (value: number) => money(value) },
    { key: "status", title: t("conversion.state"), width: 130, render: (_, row) => <ConversionStatusTag statusId={row.statusId} /> },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(value) => setRange(value as [Dayjs, Dayjs] | null)} />
        </Space>
        <PermissionCard permission={conversionPermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${config.path}/new`)}>
            {t("conversion.new")}
          </Button>
        </PermissionCard>
      </Card>
      <div className="text-sm text-secondary-text">{t(config.hintKey)}</div>
      <Card className="overflow-hidden border border-border">
        <Table<ConversionListItem>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          locale={{ emptyText: t("conversion.empty") }}
          onRow={(row) => ({ className: "cursor-pointer", onClick: () => navigate(`${config.path}/${row.id}`) })}
        />
      </Card>
    </div>
  );
}
