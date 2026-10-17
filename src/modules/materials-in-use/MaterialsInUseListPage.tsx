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
  materialsInUseJournals,
  materialsInUsePermissions,
  money,
  useMaterialsInUseList,
  type MaterialsInUseKind,
  type MaterialsInUseListItem,
} from "./api";

const statusColors: Record<number, string> = { 1: "blue", 2: "green", 3: "red" };

export function MaterialsInUseStatusTag({ statusId }: { statusId: number }) {
  const { t } = useTranslation();
  return <Tag color={statusColors[statusId] ?? "default"}>{t(`materialsInUse.status.${statusId}`)}</Tag>;
}

/** The journal of one kind: transfers into use, write-offs from use, returns from use. */
export default function MaterialsInUseListPage({ kind }: { kind: MaterialsInUseKind }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = materialsInUseJournals[kind];
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const { data = [], isFetching } = useMaterialsInUseList(kind, {
    dateFrom: range?.[0].format("YYYY-MM-DD"),
    dateTo: range?.[1].format("YYYY-MM-DD"),
  });

  const columns: TableColumnsType<MaterialsInUseListItem> = [
    { dataIndex: "docNumber", title: "№", width: 80, render: (value: string) => <b>{value}</b> },
    { dataIndex: "docDate", title: t("materialsInUse.date"), width: 150, render: (value: string) => dayjs(value).format("DD.MM.YYYY HH:mm") },
    ...(kind === 2 ? [] : [{ dataIndex: "warehouseName", title: t("materialsInUse.warehouse") }]),
    { dataIndex: "summary", title: t("materialsInUse.items") },
    { dataIndex: "amount", title: t("materialsInUse.amount"), align: "right", render: (value: number) => money(value) },
    { key: "status", title: t("materialsInUse.state"), width: 130, render: (_, row) => <MaterialsInUseStatusTag statusId={row.statusId} /> },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(value) => setRange(value as [Dayjs, Dayjs] | null)} />
        </Space>
        <PermissionCard permission={materialsInUsePermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${config.path}/new`)}>
            {t("materialsInUse.new")}
          </Button>
        </PermissionCard>
      </Card>
      <div className="text-sm text-secondary-text">{t(config.hintKey)}</div>
      <Card className="overflow-hidden border border-border">
        <Table<MaterialsInUseListItem>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          locale={{ emptyText: t("materialsInUse.empty") }}
          onRow={(row) => ({ className: "cursor-pointer", onClick: () => navigate(`${config.path}/${row.id}`) })}
        />
      </Card>
    </div>
  );
}
