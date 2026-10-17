import { useState } from "react";
import { Button, DatePicker, Input, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import {
  powerOfAttorneyPath,
  powerOfAttorneyPermissions,
  usePowersOfAttorney,
  type PowerOfAttorneyListItem,
} from "./api";

const statusColors: Record<number, string> = { 1: "blue", 2: "green", 3: "default", 4: "red" };

export function PowerOfAttorneyStatusTag({ statusId, overdue }: { statusId: number; overdue?: boolean }) {
  const { t } = useTranslation();
  return (
    <Space size={4} wrap>
      <Tag color={statusColors[statusId] ?? "default"}>{t(`powerOfAttorney.status.${statusId}`)}</Tag>
      {overdue && <Tag color="orange">{t("powerOfAttorney.overdue")}</Tag>}
    </Space>
  );
}

/**
 * The journal of issued powers of attorney (NSBU 4 app. 3): number and date, term, to whom
 * (position, name), supplier, contract, and the mark of the task done (the purchases).
 */
export default function PowerOfAttorneyListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statusId, setStatusId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { data = [], isFetching } = usePowersOfAttorney({
    dateFrom: range?.[0].format("YYYY-MM-DD"),
    dateTo: range?.[1].format("YYYY-MM-DD"),
    statusId: statusId ?? undefined,
    search: search.trim() || undefined,
  });

  const columns: TableColumnsType<PowerOfAttorneyListItem> = [
    { dataIndex: "docNumber", title: "№", width: 80, render: (value: string) => <b>{value}</b> },
    { dataIndex: "docDate", title: t("powerOfAttorney.date"), width: 110, render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
    { dataIndex: "validUntil", title: t("powerOfAttorney.validUntil"), width: 120, render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
    {
      key: "agent",
      title: t("powerOfAttorney.agent"),
      render: (_, row) => (
        <div>
          <div>{row.agentName}</div>
          {row.agentPosition && <div className="text-xs text-secondary-text">{row.agentPosition}</div>}
        </div>
      ),
    },
    { dataIndex: "counterpartyName", title: t("powerOfAttorney.supplier") },
    {
      key: "basis",
      title: t("powerOfAttorney.contractOrDocument"),
      render: (_, row) => [row.contractNumber && `${t("powerOfAttorney.contractShort")} ${row.contractNumber}`, row.basisDocument].filter(Boolean).join("; ") || "—",
    },
    {
      key: "status",
      title: t("powerOfAttorney.state"),
      width: 210,
      render: (_, row) => (
        <div>
          <PowerOfAttorneyStatusTag statusId={row.statusId} overdue={row.overdue} />
          {row.purchases.length > 0 && (
            <div className="mt-1 text-xs text-secondary-text">
              {t("powerOfAttorney.receivedBy", { numbers: row.purchases.map((number) => `№${number}`).join(", ") })}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <Input.Search allowClear placeholder={t("powerOfAttorney.search")} onSearch={setSearch} className="w-64" />
          <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(value) => setRange(value as [Dayjs, Dayjs] | null)} />
          <Select
            allowClear
            className="w-48"
            placeholder={t("powerOfAttorney.state")}
            value={statusId}
            onChange={(value?: number) => setStatusId(value ?? null)}
            options={[1, 2, 3, 4].map((id) => ({ value: id, label: t(`powerOfAttorney.status.${id}`) }))}
          />
        </Space>
        <PermissionCard permission={powerOfAttorneyPermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${powerOfAttorneyPath}/new`)}>
            {t("powerOfAttorney.new")}
          </Button>
        </PermissionCard>
      </Card>
      <div className="text-sm text-secondary-text">{t("powerOfAttorney.hint")}</div>
      <Card className="overflow-hidden border border-border">
        <Table<PowerOfAttorneyListItem>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          locale={{ emptyText: t("powerOfAttorney.empty") }}
          onRow={(row) => ({ className: "cursor-pointer", onClick: () => navigate(`${powerOfAttorneyPath}/${row.id}`) })}
        />
      </Card>
    </div>
  );
}
