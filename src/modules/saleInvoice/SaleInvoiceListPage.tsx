import { useState } from "react";
import { Button, DatePicker, Input, Select, Space, Table } from "antd";
import type { TableColumnsType } from "antd";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { Dayjs } from "dayjs";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import PermissionCard from "@/components/ui/card/PermissionCard";
import { numberSpacing } from "@/utils/utils";
import { saleInvoicePath, saleInvoicePermissions, useSaleInvoices, type SaleInvoiceListItem } from "./api";
import SaleInvoiceStatusTag from "./SaleInvoiceStatusTag";

/** 1C «Счета на оплату покупателям»: the journal of invoices with their state. */
export default function SaleInvoiceListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statusId, setStatusId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { data = [], isFetching } = useSaleInvoices({
    dateFrom: range?.[0].format("YYYY-MM-DD"),
    dateTo: range?.[1].format("YYYY-MM-DD"),
    statusId: statusId ?? undefined,
    search: search.trim() || undefined,
  });

  const columns: TableColumnsType<SaleInvoiceListItem> = [
    { dataIndex: "docNumber", title: "№", width: 90, render: (value: string) => <b>{value}</b> },
    { dataIndex: "docDate", title: t("saleInvoice.date"), width: 120, render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
    { dataIndex: "counterpartyName", title: t("saleInvoice.customer") },
    { dataIndex: "contractNumber", title: t("saleInvoice.contract"), width: 140, render: (value) => value || "—" },
    {
      dataIndex: "dueDate",
      title: t("saleInvoice.dueDate"),
      width: 130,
      render: (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "—"),
    },
    {
      dataIndex: "totalAmount",
      title: t("saleInvoice.total"),
      width: 170,
      align: "right",
      render: (value: number, row) => `${numberSpacing(value, undefined, true)} ${row.currencyCode ?? ""}`,
    },
    {
      dataIndex: "statusId",
      title: t("saleInvoice.state"),
      width: 160,
      render: (value: number) => <SaleInvoiceStatusTag statusId={value} />,
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 border border-border p-3">
        <Space wrap>
          <Input.Search allowClear placeholder={t("saleInvoice.search")} onSearch={setSearch} className="w-64" />
          <DatePicker.RangePicker format="DD.MM.YYYY" value={range} onChange={(value) => setRange(value as [Dayjs, Dayjs] | null)} />
          <Select
            allowClear
            className="w-48"
            placeholder={t("saleInvoice.state")}
            value={statusId}
            onChange={(value?: number) => setStatusId(value ?? null)}
            options={[1, 2, 3, 4].map((id) => ({ value: id, label: t(`saleInvoice.status.${id}`) }))}
          />
        </Space>
        <PermissionCard permission={saleInvoicePermissions.create}>
          <Button type="primary" icon={<Plus className="size-4" />} onClick={() => navigate(`${saleInvoicePath}/new`)}>
            {t("saleInvoice.new")}
          </Button>
        </PermissionCard>
      </Card>
      <Card className="overflow-hidden border border-border">
        <Table<SaleInvoiceListItem>
          rowKey="id"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data}
          locale={{ emptyText: t("saleInvoice.empty") }}
          onRow={(row) => ({ className: "cursor-pointer", onClick: () => navigate(`${saleInvoicePath}/${row.id}`) })}
        />
      </Card>
    </div>
  );
}
