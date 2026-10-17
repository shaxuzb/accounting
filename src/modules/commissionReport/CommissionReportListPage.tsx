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
  commissionReportKinds,
  commissionReportPath,
  commissionReportPermissions,
  money,
  useCommissionReports,
  type CommissionReportKind,
  type CommissionReportListItem,
} from "./api";

const statusColors: Record<number, string> = { 1: "blue", 2: "green", 3: "red" };

export function CommissionReportStatusTag({ statusId }: { statusId: number }) {
  const { t } = useTranslation();
  return <Tag color={statusColors[statusId] ?? "default"}>{t(`commissionReport.status.${statusId}`)}</Tag>;
}

/**
 * The commission fee reports of one side: our agents' (under sales) or ours to committents (under
 * purchases) — the period, the commission warehouse and its counterparty, the sales and the fee.
 */
export default function CommissionReportListPage({ kind }: { kind: CommissionReportKind }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const path = commissionReportPath(kind);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { data = [], isFetching } = useCommissionReports(kind, {
    dateFrom: range?.[0].format("YYYY-MM-DD"),
    dateTo: range?.[1].format("YYYY-MM-DD"),
  });
  const fromAgent = kind === commissionReportKinds.fromAgent;

  const columns: TableColumnsType<CommissionReportListItem> = [
    { dataIndex: "docNumber", title: "№", width: 80, render: (value: string) => <b>{value}</b> },
    { dataIndex: "docDate", title: t("commissionReport.date"), width: 110, render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
    {
      key: "period",
      title: t("commissionReport.period"),
      width: 190,
      render: (_, row) => `${dayjs(row.periodFrom).format("DD.MM.YYYY")} – ${dayjs(row.periodTo).format("DD.MM.YYYY")}`,
    },
    { dataIndex: "counterpartyName", title: t(fromAgent ? "commissionReport.agent" : "commissionReport.committent") },
    { dataIndex: "warehouseName", title: t("commissionReport.warehouse") },
    { dataIndex: "salesAmount", title: t("commissionReport.sales"), align: "right", render: (value: number) => money(value) },
    { dataIndex: "feeAmount", title: t("commissionReport.fee"), align: "right", render: (value: number) => <b>{money(value)}</b> },
    { dataIndex: "vatAmount", title: t("commissionReport.vat"), align: "right", render: (value: number) => money(value) },
    { key: "status", title: t("commissionReport.state"), width: 130, render: (_, row) => <CommissionReportStatusTag statusId={row.statusId} /> },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(value) => setRange(value as [Dayjs, Dayjs] | null)} />
        </Space>
        <PermissionCard permission={commissionReportPermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${path}/new`)}>
            {t("commissionReport.new")}
          </Button>
        </PermissionCard>
      </Card>
      <div className="text-sm text-secondary-text">
        {t(fromAgent ? "commissionReport.fromAgentHint" : "commissionReport.toCommittentHint")}
      </div>
      <Card className="overflow-hidden border border-border">
        <Table<CommissionReportListItem>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          locale={{ emptyText: t("commissionReport.empty") }}
          onRow={(row) => ({ className: "cursor-pointer", onClick: () => navigate(`${path}/${row.id}`) })}
        />
      </Card>
    </div>
  );
}
