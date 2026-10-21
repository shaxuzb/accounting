import { Button, Empty, Input, Segmented, Spin, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ArrowDownLeft, ArrowUpRight, ExternalLink, FileSpreadsheet, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { documentRoute } from "@/shared/constants/documentRoutes";
import { numberSpacing } from "@/utils/utils";
import { getJson } from "../../services/request";
import { exportReportTable, printReportTable, type ReportTable } from "../accounting-report/utils/reportOutput";
import {
  useAccountAnalysis,
  useAccountSubkontoTypes,
  useSubkontoBalance,
  type AccountAnalysisRow,
  type AnalyticBalance,
  type SubkontoBalanceRow,
} from "../analytic-reports/api";
import {
  ALL_TIME_FROM,
  ALL_TIME_TO,
  useAccountPeriods,
  useDrillLedger,
  type DrillEntry,
  type DrillLedger,
  type DrillSide,
} from "./api";

export type DrillTab = "entries" | "corr" | "subkonto" | "months";

export interface AccountDrillProps {
  accountId: number;
  /** The period of the trial balance; empty — all time. */
  dateFrom?: string | null;
  dateTo?: string | null;
  /** The turnover cell opened: its side only. */
  initialSide?: DrillSide | null;
  initialTab?: DrillTab;
  /** Opens another account's analysis (a correspondent account). */
  onOpenAccount: (accountId: number, label: string) => void;
}

interface SubkontoFilter {
  typeId: number;
  entityId: number | null;
  label: string;
}

const PAGE_SIZE = 50;
const money = (value: number | null | undefined) => (value ? numberSpacing(value, undefined, true) : "");
const balanceText = (value: number, t: (key: string) => string) =>
  value === 0 ? "0" : `${numberSpacing(Math.abs(value), undefined, true)} ${value > 0 ? t("app.accountDrill.dt") : t("app.accountDrill.kt")}`;

/**
 * An account opened from the trial balance — what 1C spreads over «Карточка счета», «Анализ
 * счета», «ОСВ по счету» and «Анализ счета по периодам», on one panel: the entries with the
 * document, the correspondent account and the analytics, the turnovers by correspondent
 * account (where the debit came from, where the credit went), the balances by analytics and
 * month by month. Every row narrows the entries; a correspondent account opens its own analysis.
 */
export default function AccountDrill({ accountId, dateFrom, dateTo, initialSide = null, initialTab = "entries", onOpenAccount }: AccountDrillProps) {
  const { t } = useTranslation();
  const from = dateFrom || ALL_TIME_FROM;
  const to = dateTo || ALL_TIME_TO;
  const [tab, setTab] = useState<DrillTab>(initialTab);
  const [side, setSide] = useState<DrillSide | null>(initialSide);
  const [corr, setCorr] = useState<{ id: number; number: string } | null>(null);
  const [subkonto, setSubkonto] = useState<SubkontoFilter | null>(null);
  const [month, setMonth] = useState<{ from: string; to: string; label: string } | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [subkontoTypeId, setSubkontoTypeId] = useState<number | null>(null);

  const period = { dateFrom: month?.from ?? from, dateTo: month?.to ?? to };
  const ledgerParams = {
    accountId,
    ...period,
    side,
    corrAccountId: corr?.id ?? null,
    subkontoTypeId: subkonto?.typeId ?? null,
    entityId: subkonto?.entityId ?? null,
    search: search.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  };
  const ledger = useDrillLedger(ledgerParams, tab === "entries");
  const analysis = useAccountAnalysis({ accountId, dateFrom: from, dateTo: to }, true);
  const types = useAccountSubkontoTypes(accountId);
  const activeType = subkontoTypeId ?? types.data?.[0]?.id ?? null;
  const balance = useSubkontoBalance({ accountId, subkontoTypeId: activeType, dateFrom: from, dateTo: to }, tab === "subkonto");
  const periods = useAccountPeriods({ accountId, dateFrom: from, dateTo: to }, tab === "months");

  const total = analysis.data?.total;
  const accountTitle = analysis.data ? `${analysis.data.accountNumber} ${analysis.data.accountName}` : (ledger.data ? `${ledger.data.accountCode} ${ledger.data.accountName}` : "");

  const showEntries = (patch: { side?: DrillSide | null; corr?: { id: number; number: string } | null; subkonto?: SubkontoFilter | null; month?: typeof month }) => {
    if ("side" in patch) setSide(patch.side ?? null);
    if ("corr" in patch) setCorr(patch.corr ?? null);
    if ("subkonto" in patch) setSubkonto(patch.subkonto ?? null);
    if ("month" in patch) setMonth(patch.month ?? null);
    setPage(1);
    setTab("entries");
  };

  const summary = total && (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <SummaryCard title={t("app.analyticReports.opening")} value={balanceText(total.openingDebit - total.openingCredit, t)} />
      <SummaryCard
        title={t("app.accountDrill.debitTurnover")}
        value={money(total.debit) || "0"}
        tone="debit"
        active={side === "debit" && !corr && !subkonto}
        onClick={() => showEntries({ side: "debit", corr: null, subkonto: null })}
      />
      <SummaryCard
        title={t("app.accountDrill.creditTurnover")}
        value={money(total.credit) || "0"}
        tone="credit"
        active={side === "credit" && !corr && !subkonto}
        onClick={() => showEntries({ side: "credit", corr: null, subkonto: null })}
      />
      <SummaryCard title={t("app.analyticReports.closing")} value={balanceText(total.closingDebit - total.closingCredit, t)} />
    </div>
  );

  return (
    <div className="space-y-3">
      {accountTitle && (
        <div className="text-sm text-secondary-text">
          <b className="text-text">{accountTitle}</b> ·{" "}
          {dateFrom || dateTo
            ? `${dateFrom ? dayjs(dateFrom).format("DD.MM.YYYY") : "…"} — ${dateTo ? dayjs(dateTo).format("DD.MM.YYYY") : "…"}`
            : t("app.accountDrill.allTime")}
        </div>
      )}
      {summary}
      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as DrillTab)}
        items={[
          {
            key: "entries",
            label: t("app.accountDrill.entries"),
            children: (
              <EntriesTab
                ledger={ledger.data}
                loading={ledger.isFetching}
                params={ledgerParams}
                accountTitle={accountTitle}
                filters={
                  <>
                    {side && (
                      <Tag closable color={side === "debit" ? "green" : "orange"} onClose={() => showEntries({ side: null })}>
                        {t(side === "debit" ? "app.accountDrill.onlyDebit" : "app.accountDrill.onlyCredit")}
                      </Tag>
                    )}
                    {corr && (
                      <Tag closable color="blue" onClose={() => showEntries({ corr: null })}>
                        {t("app.accountDrill.corr")}: {corr.number}
                      </Tag>
                    )}
                    {subkonto && (
                      <Tag closable color="purple" onClose={() => showEntries({ subkonto: null })}>
                        {subkonto.label}
                      </Tag>
                    )}
                    {month && (
                      <Tag closable color="cyan" onClose={() => showEntries({ month: null })}>
                        {month.label}
                      </Tag>
                    )}
                  </>
                }
                search={search}
                onSearch={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                page={page}
                onPage={setPage}
                onCorr={(entry) =>
                  entry.corrAccountId && showEntries({ corr: { id: entry.corrAccountId, number: entry.corrAccountNumber ?? "" } })
                }
              />
            ),
          },
          {
            key: "corr",
            label: t("app.accountDrill.correspondents"),
            children: (
              <CorrespondentsTab
                rows={analysis.data?.rows ?? []}
                loading={analysis.isFetching}
                onShow={(row, rowSide) => showEntries({ side: rowSide, corr: row.accountId ? { id: row.accountId, number: row.accountNumber } : null, subkonto: null })}
                onOpenAccount={onOpenAccount}
              />
            ),
          },
          {
            key: "subkonto",
            label: t("app.accountDrill.bySubkonto"),
            disabled: !types.isLoading && !types.data?.length,
            children: (
              <div className="space-y-2">
                {(types.data?.length ?? 0) > 1 && (
                  <Segmented
                    value={activeType ?? undefined}
                    onChange={(value) => setSubkontoTypeId(Number(value))}
                    options={(types.data ?? []).map((x) => ({ value: x.id, label: x.name }))}
                  />
                )}
                <BalanceTable<SubkontoBalanceRow>
                  rows={balance.data?.rows ?? []}
                  total={balance.data?.total}
                  loading={balance.isFetching}
                  rowKey={(row) => String(row.entityId)}
                  nameTitle={balance.data?.subkontoTypeName ?? ""}
                  name={(row) => row.name}
                  get={(row) => row.balance}
                  onRow={(row) =>
                    activeType &&
                    showEntries({
                      subkonto: { typeId: activeType, entityId: row.entityId, label: `${balance.data?.subkontoTypeName ?? ""}: ${row.name}` },
                      corr: null,
                    })
                  }
                />
              </div>
            ),
          },
          {
            key: "months",
            label: t("app.accountDrill.byMonths"),
            children: (
              <BalanceTable<{ year: number; month: number; balance: AnalyticBalance }>
                rows={periods.data?.months ?? []}
                total={periods.data?.total}
                loading={periods.isFetching}
                rowKey={(row) => `${row.year}-${row.month}`}
                nameTitle={t("app.accountDrill.month")}
                name={(row) => dayjs(new Date(row.year, row.month - 1, 1)).format("MM.YYYY")}
                get={(row) => row.balance}
                onRow={(row) => {
                  const start = dayjs(new Date(row.year, row.month - 1, 1));
                  const end = start.endOf("month");
                  showEntries({
                    month: {
                      from: (start.isBefore(dayjs(from)) ? dayjs(from) : start).format("YYYY-MM-DD"),
                      to: (end.isAfter(dayjs(to)) ? dayjs(to) : end).format("YYYY-MM-DD"),
                      label: start.format("MM.YYYY"),
                    },
                  });
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

function SummaryCard({ title, value, tone, active, onClick }: { title: string; value: string; tone?: "debit" | "credit"; active?: boolean; onClick?: () => void }) {
  const color = tone === "debit" ? "text-success" : tone === "credit" ? "text-warning" : "text-text";
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-left transition ${active ? "border-primary bg-primary/5" : "border-border"} ${onClick ? "cursor-pointer hover:border-primary" : "cursor-default"}`}
    >
      <div className="text-xs text-secondary-text">{title}</div>
      <div className={`text-base font-semibold tabular-nums ${color}`}>{value}</div>
    </button>
  );
}

function EntriesTab({
  ledger,
  loading,
  params,
  accountTitle,
  filters,
  search,
  onSearch,
  page,
  onPage,
  onCorr,
}: {
  ledger?: DrillLedger;
  loading: boolean;
  params: Record<string, unknown>;
  accountTitle: string;
  filters: React.ReactNode;
  search: string;
  onSearch: (value: string) => void;
  page: number;
  onPage: (page: number) => void;
  onCorr: (entry: DrillEntry) => void;
}) {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const partial = ledger?.partial ?? false;

  const columns = useMemo<ColumnsType<DrillEntry>>(
    () => [
      { title: t("app.analyticReports.date"), width: 100, render: (_, row) => dayjs(row.postingDate).format("DD.MM.YYYY") },
      {
        title: t("app.accountDrill.document"),
        width: 210,
        render: (_, row) => {
          const label = `${row.documentType}${row.documentNumber ? ` №${row.documentNumber}` : ""}`;
          const path = documentRoute(row.documentTypeId, row.documentId);
          return path ? (
            <Link to={path} className="text-primary hover:underline">
              {label}
            </Link>
          ) : (
            label
          );
        },
      },
      {
        title: t("app.accountDrill.content"),
        render: (_, row) => (
          <div>
            <div>{row.description}</div>
            {row.analytics && <div className="text-xs text-secondary-text">{row.analytics}</div>}
          </div>
        ),
      },
      {
        title: t("app.accountDrill.corr"),
        width: 170,
        render: (_, row) =>
          row.corrAccountNumber ? (
            <div>
              <Tooltip title={row.corrAccountName}>
                <button type="button" className="font-medium text-primary hover:underline" onClick={() => onCorr(row)}>
                  {row.corrAccountNumber}
                </button>
              </Tooltip>
              {row.corrAnalytics && <div className="text-xs text-secondary-text">{row.corrAnalytics}</div>}
            </div>
          ) : (
            "—"
          ),
      },
      {
        title: t("app.analyticReports.debit"),
        width: 140,
        align: "right",
        render: (_, row) => (
          <div className="tabular-nums text-success">
            {money(row.debit)}
            {row.debit !== 0 && <Extra row={row} />}
          </div>
        ),
      },
      {
        title: t("app.analyticReports.credit"),
        width: 140,
        align: "right",
        render: (_, row) => (
          <div className="tabular-nums text-warning">
            {money(row.credit)}
            {row.credit !== 0 && <Extra row={row} />}
          </div>
        ),
      },
      ...(partial
        ? []
        : [
            {
              title: t("app.accountDrill.balance"),
              width: 160,
              align: "right" as const,
              render: (_: unknown, row: DrillEntry) => <span className="whitespace-nowrap tabular-nums">{balanceText(row.runningBalance, t)}</span>,
            },
          ]),
    ],
    [onCorr, partial, t],
  );

  const outputTable = async (): Promise<ReportTable | null> => {
    setExporting(true);
    try {
      const all = await getJson<DrillLedger>("/register/ledger", { ...params, page: 1, pageSize: 10000 });
      const rows = all.transactions.map((row) => [
        dayjs(row.postingDate).format("DD.MM.YYYY"),
        `${row.documentType}${row.documentNumber ? ` №${row.documentNumber}` : ""}`,
        [row.description, row.analytics].filter(Boolean).join(" / "),
        row.corrAccountNumber ?? "—",
        row.debit || null,
        row.credit || null,
        ...(all.partial ? [] : [row.runningBalance]),
      ]);
      return {
        fileName: `hisob-${all.accountCode}`,
        title: `${t("app.accountDrill.title")}: ${accountTitle}`,
        headerLines: [`${dayjs(String(params.dateFrom)).format("DD.MM.YYYY")} — ${dayjs(String(params.dateTo)).format("DD.MM.YYYY")}`],
        columns: [
          t("app.analyticReports.date"),
          t("app.accountDrill.document"),
          t("app.accountDrill.content"),
          t("app.accountDrill.corr"),
          t("app.analyticReports.debit"),
          t("app.analyticReports.credit"),
          ...(all.partial ? [] : [t("app.accountDrill.balance")]),
        ],
        rows: [
          [t("app.analyticReports.opening"), "", "", "", null, null, ...(all.partial ? [] : [all.openingBalance])],
          ...rows,
          [t("app.analyticReports.total"), "", "", "", all.totalDebit, all.totalCredit, ...(all.partial ? [] : [all.closingBalance])],
        ],
        boldRows: [0, rows.length + 1],
      };
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          allowClear
          className="w-64!"
          prefix={<Search className="size-4 text-secondary-text" />}
          placeholder={t("app.accountDrill.searchPlaceholder")}
          defaultValue={search}
          onPressEnter={(event) => onSearch((event.target as HTMLInputElement).value)}
          onChange={(event) => !event.target.value && onSearch("")}
        />
        {filters}
        <div className="ml-auto flex gap-2">
          <Button
            icon={<FileSpreadsheet className="size-4 text-success" />}
            loading={exporting}
            disabled={!ledger?.totalCount}
            onClick={() => void outputTable().then((table) => table && exportReportTable(table))}
          >
            Excel
          </Button>
          <Button
            icon={<Printer className="size-4" />}
            loading={exporting}
            disabled={!ledger?.totalCount}
            onClick={() => void outputTable().then((table) => table && printReportTable(table))}
          >
            {t("app.accountDrill.print")}
          </Button>
        </div>
      </div>
      {partial && <div className="text-xs text-secondary-text">{t("app.accountDrill.partialHint")}</div>}
      <Table<DrillEntry>
        size="small"
        bordered
        rowKey={(row) => `${row.id}-${row.debit !== 0 ? "d" : "c"}`}
        loading={loading}
        columns={columns}
        dataSource={ledger?.transactions ?? []}
        locale={{ emptyText: <Empty description={t("app.accountDrill.noEntries")} /> }}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: ledger?.totalCount ?? 0,
          showSizeChanger: false,
          onChange: onPage,
          showTotal: (count) => t("app.accountDrill.entriesCount", { count }),
        }}
        summary={() =>
          ledger ? (
            <Table.Summary.Row className="bg-surface-muted font-semibold">
              <Table.Summary.Cell index={0} colSpan={4}>
                {t("app.analyticReports.total")}
                {!partial && (
                  <span className="ml-3 font-normal text-secondary-text">
                    {t("app.analyticReports.opening")}: {balanceText(ledger.openingBalance, t)}
                  </span>
                )}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <span className="tabular-nums text-success">{money(ledger.totalDebit)}</span>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <span className="tabular-nums text-warning">{money(ledger.totalCredit)}</span>
              </Table.Summary.Cell>
              {!partial && (
                <Table.Summary.Cell index={6} align="right">
                  <span className="whitespace-nowrap tabular-nums">{balanceText(ledger.closingBalance, t)}</span>
                </Table.Summary.Cell>
              )}
            </Table.Summary.Row>
          ) : null
        }
      />
    </div>
  );
}

/** The quantity and the currency amount of an entry, under its sum. */
function Extra({ row }: { row: DrillEntry }) {
  const parts = [
    row.quantity ? `${Number(row.quantity)}` : null,
    row.currencyAmount ? `${numberSpacing(row.currencyAmount, undefined, true)} ${row.currency}` : null,
  ].filter(Boolean);
  return parts.length ? <div className="text-xs text-secondary-text">{parts.join(" · ")}</div> : null;
}

function CorrespondentsTab({
  rows,
  loading,
  onShow,
  onOpenAccount,
}: {
  rows: AccountAnalysisRow[];
  loading: boolean;
  onShow: (row: AccountAnalysisRow, side: DrillSide) => void;
  onOpenAccount: (accountId: number, label: string) => void;
}) {
  const { t } = useTranslation();
  const table = (rowSide: DrillSide) => {
    const list = rows
      .filter((row) => (rowSide === "debit" ? row.debit : row.credit) !== 0)
      .sort((a, b) => (rowSide === "debit" ? b.debit - a.debit : b.credit - a.credit));
    const sum = list.reduce((s, row) => s + (rowSide === "debit" ? row.debit : row.credit), 0);
    const columns: ColumnsType<AccountAnalysisRow> = [
      {
        title: t("app.accountDrill.account"),
        render: (_, row) => (
          <div className="flex items-start gap-1">
            <div className="min-w-0">
              <b>{row.accountNumber}</b> <span className="text-secondary-text">{row.accountName}</span>
            </div>
            {row.accountId && (
              <Tooltip title={t("app.accountDrill.openAccount")}>
                <Button
                  size="small"
                  type="text"
                  icon={<ExternalLink className="size-3.5" />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenAccount(row.accountId!, `${row.accountNumber} ${row.accountName}`);
                  }}
                />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: t("app.accountDrill.amount"),
        width: 150,
        align: "right",
        render: (_, row) => <span className="tabular-nums">{money(rowSide === "debit" ? row.debit : row.credit)}</span>,
      },
      {
        title: "%",
        width: 60,
        align: "right",
        render: (_, row) => (sum ? `${Math.round(((rowSide === "debit" ? row.debit : row.credit) / sum) * 1000) / 10}` : ""),
      },
    ];
    return (
      <div className="min-w-0 flex-1">
        <div className={`mb-1 flex items-center gap-1 font-semibold ${rowSide === "debit" ? "text-success" : "text-warning"}`}>
          {rowSide === "debit" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
          {t(rowSide === "debit" ? "app.accountDrill.cameFrom" : "app.accountDrill.wentTo")}
          <span className="ml-auto tabular-nums">{money(sum)}</span>
        </div>
        <Table<AccountAnalysisRow>
          size="small"
          bordered
          rowKey={(row) => `${row.accountNumber}-${rowSide}`}
          loading={loading}
          columns={columns}
          dataSource={list}
          pagination={false}
          onRow={(row) => ({ onClick: () => onShow(row, rowSide), className: "cursor-pointer" })}
          locale={{ emptyText: <Empty description={t("app.accountDrill.noTurnover")} /> }}
        />
      </div>
    );
  };
  return (
    <div className="space-y-2">
      <div className="text-xs text-secondary-text">{t("app.accountDrill.corrHint")}</div>
      <div className="flex flex-col gap-4 xl:flex-row">
        {table("debit")}
        {table("credit")}
      </div>
    </div>
  );
}

function BalanceTable<T extends object>({
  rows,
  total,
  loading,
  rowKey,
  nameTitle,
  name,
  get,
  onRow,
}: {
  rows: T[];
  total?: AnalyticBalance;
  loading: boolean;
  rowKey: (row: T) => string;
  nameTitle: string;
  name: (row: T) => string;
  get: (row: T) => AnalyticBalance;
  onRow: (row: T) => void;
}) {
  const { t } = useTranslation();
  const pair = (debit: (b: AnalyticBalance) => number, credit: (b: AnalyticBalance) => number, title: string) => ({
    title,
    children: [
      { title: t("app.analyticReports.debit"), width: 145, align: "right" as const, render: (_: unknown, row: T) => <span className="whitespace-nowrap tabular-nums text-success">{money(debit(get(row)))}</span> },
      { title: t("app.analyticReports.credit"), width: 145, align: "right" as const, render: (_: unknown, row: T) => <span className="whitespace-nowrap tabular-nums text-warning">{money(credit(get(row)))}</span> },
    ],
  });
  const columns: ColumnsType<T> = [
    { title: nameTitle, render: (_, row) => name(row) },
    pair((b) => b.openingDebit, (b) => b.openingCredit, t("app.analyticReports.opening")),
    pair((b) => b.debit, (b) => b.credit, t("app.analyticReports.turnover")),
    pair((b) => b.closingDebit, (b) => b.closingCredit, t("app.analyticReports.closing")),
  ];
  if (loading && !rows.length) return <Spin className="block py-8" />;
  return (
    <Table<T>
      size="small"
      bordered
      rowKey={rowKey}
      loading={loading}
      columns={columns}
      dataSource={rows}
      pagination={false}
      scroll={{ x: 900 }}
      onRow={(row) => ({ onClick: () => onRow(row), className: "cursor-pointer" })}
      locale={{ emptyText: <Empty description={t("app.accountDrill.noTurnover")} /> }}
      summary={() =>
        total ? (
          <Table.Summary.Row className="bg-surface-muted font-semibold">
            <Table.Summary.Cell index={0}>{t("app.analyticReports.total")}</Table.Summary.Cell>
            {(["openingDebit", "openingCredit", "debit", "credit", "closingDebit", "closingCredit"] as const).map((key, index) => (
              <Table.Summary.Cell key={key} index={index + 1} align="right">
                <span className="whitespace-nowrap tabular-nums">{money(total[key])}</span>
              </Table.Summary.Cell>
            ))}
          </Table.Summary.Row>
        ) : null
      }
    />
  );
}
