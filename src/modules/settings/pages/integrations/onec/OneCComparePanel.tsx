import { Alert, Button, Empty, Input, Select, Table, Tabs, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { RefreshCw, Scale } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/utils";
import {
  errorText,
  useCompareOneC,
  useOneCComparison,
  useOneCPostings,
  type OneCAccountCompare,
  type OneCEvidenceRow,
  type OneCFinding,
  type OneCPostingLine,
  type OneCVerdict,
} from "./api";

const T = "settings.integrations.onec";
const C = `${T}.compare`;

const VERDICTS: OneCVerdict[] = ["ONEC_ERROR", "MAPPING", "OURS", "METHOD", "UNEXPLAINED"];

/** Who the difference is down to: 1C red, a setting orange, ours blue, method grey, unproven purple. */
export const verdictColor: Record<OneCVerdict, string> = {
  ONEC_ERROR: "red",
  MAPPING: "orange",
  OURS: "blue",
  METHOD: "default",
  UNEXPLAINED: "purple",
};

const verdictCard: Record<OneCVerdict, string> = {
  ONEC_ERROR: "border-red-300 bg-red-50 dark:bg-red-950/30",
  MAPPING: "border-orange-300 bg-orange-50 dark:bg-orange-950/30",
  OURS: "border-blue-300 bg-blue-50 dark:bg-blue-950/30",
  METHOD: "border-gray-300 bg-gray-50 dark:bg-gray-800/40",
  UNEXPLAINED: "border-purple-300 bg-purple-50 dark:bg-purple-950/30",
};

const money = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

export function EvidenceTable({ rows, onOpen }: { rows: OneCEvidenceRow[]; onOpen: (id: number) => void }) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;
  const hasQuantity = rows.some((row) => row.quantity !== null);
  const hasBalance = rows.some((row) => row.balance !== null);
  const columns: TableColumnsType<OneCEvidenceRow> = [
    { title: t(`${C}.date`), width: 110, render: (_, row) => (row.date ? formatDate(row.date, "DD.MM.YYYY") : "—") },
    {
      title: t(`${C}.document`),
      render: (_, row) =>
        row.objectId ? (
          <Button type="link" size="small" className="h-auto! p-0! text-left! whitespace-normal!" onClick={() => onOpen(row.objectId!)}>
            {row.document}
          </Button>
        ) : (
          row.document ?? "—"
        ),
    },
    { title: t(`${C}.account`), width: 170, render: (_, row) => row.account ?? "—" },
    { title: t(`${C}.item`), render: (_, row) => row.item ?? "—" },
    { title: t(`${C}.amount`), width: 130, align: "right", render: (_, row) => money(row.amount) },
    ...(hasQuantity
      ? [{ title: t(`${C}.quantity`), width: 80, align: "right" as const, render: (_: unknown, row: OneCEvidenceRow) => row.quantity ?? "—" }]
      : []),
    ...(hasBalance
      ? [
          {
            title: t(`${C}.balance`),
            width: 130,
            align: "right" as const,
            render: (_: unknown, row: OneCEvidenceRow) => (
              <span className={row.balance !== null && row.balance < 0 ? "font-semibold text-red-600" : undefined}>{money(row.balance)}</span>
            ),
          },
        ]
      : []),
    { title: t(`${C}.note`), render: (_, row) => row.note ?? "" },
  ];
  return (
    <Table
      rowKey={(_, index) => String(index)}
      size="small"
      pagination={false}
      scroll={{ x: "max-content" }}
      columns={columns}
      dataSource={rows}
    />
  );
}

function FindingDetails({ finding, onOpen }: { finding: OneCFinding; onOpen: (id: number) => void }) {
  return (
    <div className="space-y-3 py-1">
      {finding.explanation && <p className="m-0 whitespace-pre-line text-sm">{finding.explanation}</p>}
      <EvidenceTable rows={finding.evidence} onOpen={onOpen} />
    </div>
  );
}

function AccountsCompare({ rows }: { rows: OneCAccountCompare[] }) {
  const { t } = useTranslation();
  const columns: TableColumnsType<OneCAccountCompare> = [
    { title: t(`${C}.oneCAccount`), width: 120, render: (_, row) => row.oneCCode },
    { title: t(`${C}.ourAccount`), width: 110, render: (_, row) => row.ourNumber ?? "—" },
    { title: t(`${C}.oneCDebit`), align: "right", render: (_, row) => money(row.oneCDebit) },
    { title: t(`${C}.ourDebit`), align: "right", render: (_, row) => money(row.ourDebit) },
    { title: t(`${C}.oneCCredit`), align: "right", render: (_, row) => money(row.oneCCredit) },
    { title: t(`${C}.ourCredit`), align: "right", render: (_, row) => money(row.ourCredit) },
    {
      title: t(`${C}.notImported`),
      align: "right",
      render: (_, row) => money(row.notImportedDebit - row.notImportedCredit),
    },
    {
      title: t(`${C}.saldoDifference`),
      align: "right",
      render: (_, row) => <span className={Math.abs(row.saldoDifference) >= 0.01 ? "font-semibold" : undefined}>{money(row.saldoDifference)}</span>,
    },
    {
      title: t(`${C}.unexplained`),
      align: "right",
      render: (_, row) =>
        Math.abs(row.unexplained) >= 0.01 ? <span className="font-semibold text-red-600">{money(row.unexplained)}</span> : <Tag color="green">0</Tag>,
    },
  ];
  return (
    <div className="space-y-2">
      <Alert showIcon type="info" message={t(`${C}.accountsHint`)} />
      <Table rowKey="oneCCode" size="small" pagination={false} scroll={{ x: "max-content" }} columns={columns} dataSource={rows} />
    </div>
  );
}

/** «1C bilan taqqoslash»: the run's findings grouped by whose they are, each with its proof. */
export function CompareTab({ runId, version, onOpen }: { runId: number; version: string; onOpen: (id: number) => void }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<{ verdict?: string; category?: string; search?: string; page: number; pageSize: number }>({
    page: 1,
    pageSize: 50,
  });
  const comparison = useOneCComparison(runId, filter, version, true);
  const compare = useCompareOneC();
  const data = comparison.data;
  const summary = Object.fromEntries((data?.summary ?? []).map((item) => [item.verdict, item]));

  const columns: TableColumnsType<OneCFinding> = [
    {
      title: t(`${C}.verdict`),
      width: 150,
      render: (_, item) => <Tag color={verdictColor[item.verdict]}>{t(`${C}.verdicts.${item.verdict}`)}</Tag>,
    },
    {
      title: t(`${C}.document`),
      width: 260,
      render: (_, item) =>
        item.objectId ? (
          <Button
            type="link"
            size="small"
            className="h-auto! p-0! text-left! whitespace-normal!"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(item.objectId!);
            }}
          >
            {item.presentation ?? item.docNumber ?? item.typeName}
          </Button>
        ) : (
          "—"
        ),
    },
    { title: t(`${C}.category`), width: 160, render: (_, item) => t(`${C}.categories.${item.category}`) },
    { title: t(`${C}.finding`), render: (_, item) => item.title },
    { title: t(`${C}.amount`), width: 140, align: "right", render: (_, item) => money(item.amount) },
  ];

  const run = () =>
    compare.mutate(runId, {
      onSuccess: () => toast.success(t(`${C}.done`)),
      onError: (error) => toast.error(errorText(error, t(`${T}.error`))),
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-secondary-text">
          {data?.comparedAt ? t(`${C}.comparedAt`, { date: formatDate(data.comparedAt, "DD.MM.YYYY HH:mm") }) : t(`${C}.never`)}
        </div>
        <Button type="primary" icon={data?.comparedAt ? <RefreshCw className="size-4" /> : <Scale className="size-4" />} loading={compare.isPending} onClick={run}>
          {t(data?.comparedAt ? `${C}.again` : `${C}.run`)}
        </Button>
      </div>

      {!data?.comparedAt ? (
        <Empty description={t(`${C}.empty`)} />
      ) : (
        <Tabs
          items={[
            {
              key: "findings",
              label: t(`${C}.findings`, { count: data.summary.reduce((sum, item) => sum + item.count, 0) }),
              children: (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {VERDICTS.map((verdict) => {
                      const item = summary[verdict];
                      const active = filter.verdict === verdict;
                      return (
                        <button
                          key={verdict}
                          type="button"
                          onClick={() => setFilter({ ...filter, verdict: active ? undefined : verdict, page: 1 })}
                          className={`rounded-lg border p-3 text-left transition ${verdictCard[verdict]} ${active ? "ring-2 ring-primary" : ""}`}
                        >
                          <div className="text-sm font-medium">{t(`${C}.verdicts.${verdict}`)}</div>
                          <div className="text-2xl font-semibold">{item?.count ?? 0}</div>
                          <div className="text-xs text-secondary-text">{money(item?.amount ?? 0)}</div>
                          <div className="mt-1 text-xs text-secondary-text">{t(`${C}.verdictHints.${verdict}`)}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Select
                      allowClear
                      className="w-56"
                      placeholder={t(`${C}.category`)}
                      value={filter.category}
                      onChange={(category) => setFilter({ ...filter, category, page: 1 })}
                      options={["BANK_BALANCE", "STOCK_BALANCE", "SETTLEMENT", "COST", "ANALYTICS", "SERVICE_ON_STOCK", "NO_ENTRIES", "CLASSIFIER", "MAPPING", "ROUNDING", "OTHER"].map(
                        (value) => ({ value, label: t(`${C}.categories.${value}`) }),
                      )}
                    />
                    <Input.Search
                      allowClear
                      className="w-72"
                      placeholder={t(`${C}.search`)}
                      onSearch={(search) => setFilter({ ...filter, search: search || undefined, page: 1 })}
                    />
                  </div>

                  <Table
                    rowKey="id"
                    size="small"
                    loading={comparison.isFetching}
                    columns={columns}
                    dataSource={data.findings}
                    expandable={{ expandedRowRender: (item) => <FindingDetails finding={item} onOpen={onOpen} />, expandRowByClick: true }}
                    pagination={{
                      current: filter.page,
                      pageSize: filter.pageSize,
                      total: data.total,
                      showSizeChanger: true,
                      onChange: (page, pageSize) => setFilter({ ...filter, page, pageSize }),
                    }}
                    locale={{ emptyText: <Empty description={t(`${C}.noFindings`)} /> }}
                  />
                </div>
              ),
            },
            { key: "accounts", label: t(`${C}.byAccounts`), children: <AccountsCompare rows={data.accounts} /> },
          ]}
        />
      )}
    </div>
  );
}

/** A document's entries in 1C and ours, side by side (in the object drawer). */
export function PostingsCompare({ objectId }: { objectId: number | null }) {
  const { t } = useTranslation();
  const postings = useOneCPostings(objectId, true);
  const data = postings.data;
  if (!data || (data.oneC.length === 0 && data.ours.length === 0)) return null;
  const columns: TableColumnsType<OneCPostingLine> = [
    { title: "Dt", width: 80, render: (_, row) => row.debit ?? "—" },
    { title: "Kt", width: 80, render: (_, row) => row.credit ?? "—" },
    { title: t(`${C}.amount`), width: 130, align: "right", render: (_, row) => money(row.amount) },
    { title: t(`${C}.content`), render: (_, row) => row.content ?? "" },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{t(`${C}.postings`)}</span>
        {data.checkStatus && (
          <Tag color={data.checkStatus === "MATCH" ? "green" : "red"}>{t(`${C}.check.${data.checkStatus}`)}</Tag>
        )}
      </div>
      {data.checkStatus === "DIFF" && data.checkNote && <Alert type="warning" showIcon message={data.checkNote} />}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-secondary-text">1C</div>
          <Table rowKey={(_, index) => String(index)} size="small" pagination={false} columns={columns} dataSource={data.oneC} />
        </div>
        <div>
          <div className="mb-1 text-xs text-secondary-text">{t(`${C}.ours`)}</div>
          <Table rowKey={(_, index) => String(index)} size="small" pagination={false} columns={columns} dataSource={data.ours} />
        </div>
      </div>
    </div>
  );
}
