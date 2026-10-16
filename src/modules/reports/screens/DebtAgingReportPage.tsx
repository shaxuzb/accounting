import { useState } from "react";
import { DatePicker, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import dayjs from "@/config/dayjs";
import Card from "@/components/ui/card/Card";
import { getJson } from "@/modules/accountings/services/request";
import { numberSpacing } from "@/utils/utils";

const bucketNames = ["0-30", "31-60", "61-90", "90+"] as const;

interface AgingDocument {
  contractId?: number | null;
  contractNumber?: string | null;
  documentTypeId: number;
  documentTypeName: string;
  documentId: number;
  docNumber: string;
  docDate: string;
  dueDate?: string | null;
  amount: number;
  ageDays: number;
  overdueDays?: number | null;
  bucket: string;
}

interface AgingCounterparty {
  counterpartyId: number;
  counterpartyName: string;
  amount: number;
  overdue: number;
  buckets: Record<string, number>;
  documents: AgingDocument[];
}

interface AgingReport {
  asOf: string;
  total: number;
  overdue: number;
  buckets: Record<string, number>;
  counterparties: AgingCounterparty[];
}

const money = (value?: number | null) => numberSpacing(Number(value ?? 0), undefined, true);
const day = (value?: string | null) => (value ? dayjs(value).format("DD.MM.YYYY") : "—");

/**
 * 1C «Задолженность покупателей (поставщикам) по срокам долга»: the debts still open, each at
 * the date of the document it arose on, by age, with what is past the contract's payment term.
 */
export default function DebtAgingReportPage({ side }: { side: "receivable" | "payable" }) {
  const { t } = useTranslation();
  const [date, setDate] = useState(dayjs());
  const asOf = date.format("YYYY-MM-DD");
  const { data, isFetching } = useQuery({
    queryKey: ["reports", "aging", side, asOf],
    queryFn: () => getJson<AgingReport>(`/reports/${side}/aging`, { date: asOf }),
  });

  const bucketColumns = bucketNames.map((bucket) => ({
    key: bucket,
    title: t("reports.aging.days", { range: bucket }),
    width: 130,
    align: "right" as const,
    render: (_: unknown, row: AgingCounterparty) => money(row.buckets[bucket]),
  }));

  const columns: TableColumnsType<AgingCounterparty> = [
    { dataIndex: "counterpartyName", title: t("reports.aging.counterparty") },
    {
      dataIndex: "amount",
      title: t("reports.aging.debt"),
      width: 160,
      align: "right",
      render: (value: number) => <b>{money(value)}</b>,
    },
    {
      dataIndex: "overdue",
      title: t("reports.aging.overdue"),
      width: 160,
      align: "right",
      render: (value: number) =>
        value > 0 ? <span className="text-red-600 dark:text-red-400">{money(value)}</span> : money(0),
    },
    ...bucketColumns,
  ];

  const documentColumns: TableColumnsType<AgingDocument> = [
    {
      key: "document",
      title: t("reports.aging.document"),
      render: (_, row) => `${row.documentTypeName} №${row.docNumber}`,
    },
    { dataIndex: "contractNumber", title: t("reports.aging.contract"), width: 140, render: (value) => value || "—" },
    { dataIndex: "docDate", title: t("reports.aging.docDate"), width: 120, render: day },
    {
      dataIndex: "dueDate",
      title: t("reports.aging.dueDate"),
      width: 120,
      render: (value?: string | null) => (value ? day(value) : t("reports.aging.noTerm")),
    },
    { dataIndex: "ageDays", title: t("reports.aging.ageDays"), width: 100, align: "right" },
    {
      dataIndex: "overdueDays",
      title: t("reports.aging.overdueDays"),
      width: 120,
      align: "right",
      render: (value?: number | null) => (value ? <Tag color="red">{value}</Tag> : "—"),
    },
    { dataIndex: "amount", title: t("reports.aging.debt"), width: 150, align: "right", render: money },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Typography.Title level={4} className="!mb-1 !text-text">
            {t(side === "receivable" ? "reports.pages.receivableAging" : "reports.pages.payableAging")}
          </Typography.Title>
          <p className="text-sm text-secondary-text">{t("reports.aging.hint")}</p>
        </div>
        <div>
          <div className="mb-1 text-sm text-secondary-text">{t("reports.aging.asOf")}</div>
          <DatePicker value={date} format="DD.MM.YYYY" allowClear={false} onChange={(value) => value && setDate(value)} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Card className="border border-border p-3">
          <div className="text-xs text-secondary-text">{t("reports.aging.debt")}</div>
          <div className="text-lg font-semibold">{money(data?.total)}</div>
        </Card>
        <Card className="border border-border p-3">
          <div className="text-xs text-secondary-text">{t("reports.aging.overdue")}</div>
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">{money(data?.overdue)}</div>
        </Card>
        {bucketNames.map((bucket) => (
          <Card key={bucket} className="border border-border p-3">
            <div className="text-xs text-secondary-text">{t("reports.aging.days", { range: bucket })}</div>
            <div className="text-lg font-semibold">{money(data?.buckets?.[bucket])}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border border-border">
        <Table<AgingCounterparty>
          rowKey="counterpartyId"
          size="middle"
          loading={isFetching}
          columns={columns}
          dataSource={data?.counterparties ?? []}
          pagination={false}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: t("reports.aging.empty") }}
          expandable={{
            expandedRowRender: (row) => (
              <Table<AgingDocument>
                rowKey={(item) => `${item.documentTypeId}-${item.documentId}-${item.contractId ?? 0}`}
                size="small"
                pagination={false}
                columns={documentColumns}
                dataSource={row.documents}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
