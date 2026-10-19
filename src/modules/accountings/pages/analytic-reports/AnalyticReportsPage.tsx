import { Alert, Button, DatePicker, Empty, Segmented, Select, Spin, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { FileSpreadsheet, Printer, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContractSelect from "@/components/fields/ContractSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  counterpartySelectDisplayConfig,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import { numberSpacing } from "@/utils/utils";
import AccountingReportPageShell from "../accounting-report/components/AccountingReportPageShell";
import { exportForm } from "../regulated-forms/shared";
import {
  useAccountAnalysis,
  useAccountSubkontoTypes,
  useChessSheet,
  useGeneralLedger,
  useReconciliationAct,
  useSubkontoBalance,
  useSubkontoCard,
  type AccountAnalysisRow,
  type AnalyticBalance,
  type GeneralLedgerAccount,
  type ReconciliationAct,
  type ReconciliationActRow,
  type SubkontoBalanceRow,
  type SubkontoCardRow,
} from "./api";

type ReportKind = "subkonto-balance" | "account-analysis" | "subkonto-card" | "general-ledger" | "chess-sheet" | "reconciliation-act";

interface State {
  report: ReportKind;
  dateFrom: string;
  dateTo: string;
  accountId: number | null;
  subkontoTypeId: number | null;
  entityId: number | null;
  detailed: boolean;
  counterpartyId?: number | null;
  contractId?: number | null;
}

const money = (value: number | null | undefined) => (value ? numberSpacing(value, undefined, true) : "");
const num = (value: number | null | undefined) => <span className="tabular-nums">{money(value)}</span>;
const bold = (value: number | null | undefined) => <span className="font-semibold tabular-nums">{money(value)}</span>;
/** A running balance on the side it stands, as 1C shows «Сальдо»: the amount and Dt or Kt. */
const sided = (value: number | null | undefined, debitLabel: string, creditLabel: string) =>
  value ? (
    <span className="tabular-nums">
      {money(Math.abs(value))} <span className="text-secondary-text">{value > 0 ? debitLabel : creditLabel}</span>
    </span>
  ) : (
    "—"
  );

/** The six columns of a balance: opening, turnovers and closing, each on the debit and the credit. */
const balanceColumns = <T,>(t: (key: string) => string, get: (row: T) => AnalyticBalance): ColumnsType<T> => [
  {
    title: t("app.analyticReports.opening"),
    children: [
      { title: t("app.analyticReports.debit"), width: 140, align: "right", render: (_, row) => num(get(row).openingDebit) },
      { title: t("app.analyticReports.credit"), width: 140, align: "right", render: (_, row) => num(get(row).openingCredit) },
    ],
  },
  {
    title: t("app.analyticReports.turnover"),
    children: [
      { title: t("app.analyticReports.debit"), width: 140, align: "right", render: (_, row) => num(get(row).debit) },
      { title: t("app.analyticReports.credit"), width: 140, align: "right", render: (_, row) => num(get(row).credit) },
    ],
  },
  {
    title: t("app.analyticReports.closing"),
    children: [
      { title: t("app.analyticReports.debit"), width: 140, align: "right", render: (_, row) => num(get(row).closingDebit) },
      { title: t("app.analyticReports.credit"), width: 140, align: "right", render: (_, row) => num(get(row).closingCredit) },
    ],
  },
];

const escapeHtml = (value: string | null | undefined) =>
  (value ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

/**
 * The act as 1C prints «Акт сверки взаиморасчетов»: the organization's data on the left, the
 * counterparty's columns left empty for it to fill, the balance in favour of whom, the signatures.
 */
const printReconciliation = (d: ReconciliationAct, t: (key: string, options?: Record<string, unknown>) => string) => {
  const f = (v: number) => (v ? numberSpacing(v, undefined, true) : "");
  const period = `${dayjs(d.dateFrom).format("DD.MM.YYYY")} — ${dayjs(d.dateTo).format("DD.MM.YYYY")}`;
  const side = (v: number) => (v > 0 ? [f(v), ""] : [" ", f(-v)]);
  const [od, oc] = side(d.openingBalance);
  const [cd, cc] = side(d.closingBalance);
  const conclusion =
    d.closingBalance === 0
      ? t("app.analyticReports.reconciliation.noDebt", { date: dayjs(d.dateTo).format("DD.MM.YYYY") })
      : t("app.analyticReports.reconciliation.debtInFavour", {
          date: dayjs(d.dateTo).format("DD.MM.YYYY"),
          name: d.closingBalance > 0 ? d.organizationName : d.counterpartyName,
          amount: f(Math.abs(d.closingBalance)),
        });
  const rows = d.rows
    .map(
      (r) =>
        `<tr><td>${dayjs(r.date).format("DD.MM.YYYY")}</td><td>${escapeHtml(r.documentType)} №${escapeHtml(r.number ?? String(r.documentId))}</td><td class="n">${f(r.debit)}</td><td class="n">${f(r.credit)}</td><td></td><td></td><td></td><td></td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(t("app.analyticReports.kinds.reconciliation-act"))}</title>
<style>body{font-family:Arial,sans-serif;font-size:12px;margin:24px}h2{text-align:center;margin:0 0 4px}p{margin:4px 0}table{border-collapse:collapse;width:100%;margin-top:10px}td,th{border:1px solid #000;padding:3px 5px}th{background:#eee}.n{text-align:right;white-space:nowrap}.b{font-weight:bold}.sig{display:flex;justify-content:space-between;margin-top:28px}.sig div{width:45%}</style></head><body>
<h2>${escapeHtml(t("app.analyticReports.kinds.reconciliation-act"))}</h2>
<p style="text-align:center">${escapeHtml(t("app.analyticReports.reconciliation.between", { org: d.organizationName, cp: d.counterpartyName }))}</p>
<p style="text-align:center">${escapeHtml(period)}${d.contractName ? ` · ${escapeHtml(t("app.analyticReports.reconciliation.contract"))}: ${escapeHtml(d.contractName)}` : ""}</p>
<table><thead><tr><th colspan="4">${escapeHtml(t("app.analyticReports.reconciliation.ourData", { name: d.organizationName }))}</th><th colspan="4">${escapeHtml(t("app.analyticReports.reconciliation.theirData", { name: d.counterpartyName }))}</th></tr>
<tr><th>${t("app.analyticReports.date")}</th><th>${t("app.analyticReports.document")}</th><th>${t("app.analyticReports.debit")}</th><th>${t("app.analyticReports.credit")}</th><th>${t("app.analyticReports.date")}</th><th>${t("app.analyticReports.document")}</th><th>${t("app.analyticReports.debit")}</th><th>${t("app.analyticReports.credit")}</th></tr></thead>
<tbody><tr class="b"><td colspan="2">${t("app.analyticReports.opening")}</td><td class="n">${od}</td><td class="n">${oc}</td><td colspan="2"></td><td></td><td></td></tr>
${rows}
<tr class="b"><td colspan="2">${t("app.analyticReports.turnover")}</td><td class="n">${f(d.totalDebit)}</td><td class="n">${f(d.totalCredit)}</td><td colspan="2"></td><td></td><td></td></tr>
<tr class="b"><td colspan="2">${t("app.analyticReports.closing")}</td><td class="n">${cd}</td><td class="n">${cc}</td><td colspan="2"></td><td></td><td></td></tr></tbody></table>
<p class="b" style="margin-top:12px">${escapeHtml(conclusion)}</p>
<div class="sig"><div><p class="b">${escapeHtml(d.organizationName)}</p><p>${escapeHtml(t("app.analyticReports.reconciliation.director"))}: ____________ ${escapeHtml(d.director)}</p><p>${escapeHtml(t("app.analyticReports.reconciliation.chiefAccountant"))}: ____________ ${escapeHtml(d.chiefAccountant)}</p><p>${escapeHtml(t("app.analyticReports.reconciliation.stamp"))}</p></div>
<div><p class="b">${escapeHtml(d.counterpartyName)}</p><p>${escapeHtml(t("app.analyticReports.reconciliation.director"))}: ____________</p><p>${escapeHtml(t("app.analyticReports.reconciliation.chiefAccountant"))}: ____________</p><p>${escapeHtml(t("app.analyticReports.reconciliation.stamp"))}</p></div></div>
<script>window.onload=()=>window.print()</script></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
};

const balanceCells = (b: AnalyticBalance) => [b.openingDebit, b.openingCredit, b.debit, b.credit, b.closingDebit, b.closingCredit];

function TotalRow({ label, values, offset = 1 }: { label: string; values: (number | null)[]; offset?: number }) {
  return (
    <Table.Summary.Row className="bg-primary-bg">
      <Table.Summary.Cell index={0} colSpan={offset}>
        <span className="font-semibold">{label}</span>
      </Table.Summary.Cell>
      {values.map((value, index) => (
        <Table.Summary.Cell key={index} index={index + offset} align="right">
          {bold(value)}
        </Table.Summary.Cell>
      ))}
    </Table.Summary.Row>
  );
}

/** 1C's analytic reports: by analytics, account analysis, analytics card, general ledger and chess sheet. */
export default function AnalyticReportsPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "analytic-reports");
  const [state, setState] = usePersistedState<State>(
    key,
    {
      report: "subkonto-balance",
      dateFrom: dayjs().startOf("month").format("YYYY-MM-DD"),
      dateTo: dayjs().format("YYYY-MM-DD"),
      accountId: null,
      subkontoTypeId: null,
      entityId: null,
      detailed: false,
    },
    { debounceMs: 0 },
  );
  const set = (patch: Partial<State>) => setState({ ...state, ...patch });
  const period = { dateFrom: state.dateFrom, dateTo: state.dateTo };
  const types = useAccountSubkontoTypes(state.report === "subkonto-balance" ? state.accountId : null);

  const balance = useSubkontoBalance({ ...period, accountId: state.accountId, subkontoTypeId: state.subkontoTypeId }, state.report === "subkonto-balance");
  const analysis = useAccountAnalysis({ ...period, accountId: state.accountId }, state.report === "account-analysis");
  const card = useSubkontoCard(
    { ...period, subkontoTypeId: state.subkontoTypeId, entityId: state.entityId, accountId: state.accountId },
    state.report === "subkonto-card",
  );
  const ledger = useGeneralLedger({ ...period, detailed: state.detailed }, state.report === "general-ledger");
  const chess = useChessSheet({ ...period, detailed: state.detailed }, state.report === "chess-sheet");
  const reconciliation = useReconciliationAct(
    { ...period, counterpartyId: state.counterpartyId ?? null, contractId: state.contractId ?? null },
    state.report === "reconciliation-act",
  );
  const active = {
    "subkonto-balance": balance,
    "account-analysis": analysis,
    "subkonto-card": card,
    "general-ledger": ledger,
    "chess-sheet": chess,
    "reconciliation-act": reconciliation,
  }[state.report];
  const periodText = `${dayjs(state.dateFrom).format("DD.MM.YYYY")} — ${dayjs(state.dateTo).format("DD.MM.YYYY")}`;

  const balanceHeaders = [
    `${t("app.analyticReports.opening")}: ${t("app.analyticReports.debit")}`,
    `${t("app.analyticReports.opening")}: ${t("app.analyticReports.credit")}`,
    `${t("app.analyticReports.turnover")}: ${t("app.analyticReports.debit")}`,
    `${t("app.analyticReports.turnover")}: ${t("app.analyticReports.credit")}`,
    `${t("app.analyticReports.closing")}: ${t("app.analyticReports.debit")}`,
    `${t("app.analyticReports.closing")}: ${t("app.analyticReports.credit")}`,
  ];

  const handleExport = () => {
    const file = `${state.report}-${state.dateFrom}-${state.dateTo}.xlsx`;
    const title = t(`app.analyticReports.kinds.${state.report}`);
    if (state.report === "subkonto-balance" && balance.data) {
      const d = balance.data;
      exportForm(file, [title, `${d.accountNumber} ${d.accountName} · ${d.subkontoTypeName}`, periodText], [d.subkontoTypeName, ...balanceHeaders], [
        ...d.rows.map((x) => [x.name, ...balanceCells(x.balance)]),
        [t("app.analyticReports.total"), ...balanceCells(d.total)],
      ]);
    } else if (state.report === "account-analysis" && analysis.data) {
      const d = analysis.data;
      exportForm(file, [title, `${d.accountNumber} ${d.accountName}`, periodText], [t("app.analyticReports.correspondent"), t("app.analyticReports.debit"), t("app.analyticReports.credit")], [
        [t("app.analyticReports.opening"), d.total.openingDebit, d.total.openingCredit],
        ...d.rows.map((x) => [`${x.accountNumber} ${x.accountName}`, x.debit, x.credit]),
        [t("app.analyticReports.turnover"), d.total.debit, d.total.credit],
        [t("app.analyticReports.closing"), d.total.closingDebit, d.total.closingCredit],
      ]);
    } else if (state.report === "subkonto-card" && card.data) {
      const d = card.data;
      exportForm(
        file,
        [title, `${d.subkontoTypeName}: ${d.name}`, periodText],
        [
          t("app.analyticReports.date"),
          t("app.analyticReports.document"),
          t("app.analyticReports.content"),
          t("app.analyticReports.debitAccount"),
          t("app.analyticReports.creditAccount"),
          t("app.analyticReports.debit"),
          t("app.analyticReports.credit"),
          t("app.analyticReports.balance"),
        ],
        [
          [t("app.analyticReports.opening"), "", "", "", "", null, null, d.openingBalance],
          ...d.rows.map((x) => [dayjs(x.date).format("DD.MM.YYYY"), `${x.documentType ?? ""} ${x.number ?? ""}`, x.content, x.debitAccount, x.creditAccount, x.debit, x.credit, x.balance]),
          [t("app.analyticReports.closing"), "", "", "", "", d.totalDebit, d.totalCredit, d.closingBalance],
        ],
      );
    } else if (state.report === "general-ledger" && ledger.data) {
      const d = ledger.data;
      exportForm(file, [title, periodText], [t("app.analyticReports.account"), t("app.analyticReports.period"), ...balanceHeaders], [
        ...d.accounts.flatMap((a) => [
          [`${a.accountNumber} ${a.accountName}`, t("app.analyticReports.total"), ...balanceCells(a.total)],
          ...a.months.map((m) => ["", dayjs(new Date(m.year, m.month - 1, 1)).format("MMMM YYYY"), ...balanceCells(m.balance)]),
        ]),
        [t("app.analyticReports.total"), "", ...balanceCells(d.total)],
      ]);
    } else if (state.report === "reconciliation-act" && reconciliation.data) {
      const d = reconciliation.data;
      exportForm(
        file,
        [title, `${d.organizationName} — ${d.counterpartyName}`, periodText, d.contractName ?? ""],
        [t("app.analyticReports.date"), t("app.analyticReports.document"), t("app.analyticReports.debit"), t("app.analyticReports.credit")],
        [
          [t("app.analyticReports.opening"), "", d.openingBalance > 0 ? d.openingBalance : null, d.openingBalance < 0 ? -d.openingBalance : null],
          ...d.rows.map((x) => [dayjs(x.date).format("DD.MM.YYYY"), `${x.documentType ?? ""} №${x.number ?? x.documentId}`, x.debit || null, x.credit || null]),
          [t("app.analyticReports.turnover"), "", d.totalDebit, d.totalCredit],
          [t("app.analyticReports.closing"), "", d.closingBalance > 0 ? d.closingBalance : null, d.closingBalance < 0 ? -d.closingBalance : null],
        ],
      );
    } else if (state.report === "chess-sheet" && chess.data) {
      const d = chess.data;
      const cell = new Map(d.cells.map((c) => [`${c.debit}|${c.credit}`, c.amount]));
      exportForm(file, [title, periodText], [`${t("app.analyticReports.debit")} \\ ${t("app.analyticReports.credit")}`, ...d.creditAccounts.map((c) => c.number), t("app.analyticReports.total")], [
        ...d.debitAccounts.map((r) => [
          r.number,
          ...d.creditAccounts.map((c) => cell.get(`${r.number}|${c.number}`) ?? null),
          d.cells.filter((c) => c.debit === r.number).reduce((s, c) => s + c.amount, 0),
        ]),
        [t("app.analyticReports.total"), ...d.creditAccounts.map((c) => d.cells.filter((x) => x.credit === c.number).reduce((s, x) => s + x.amount, 0)), d.total],
      ]);
    }
  };

  const accountSelect = (optional: boolean) => (
    <div className="w-72">
      <SelectCustom
        placeholder={optional ? "app.analyticReports.anyAccount" : "app.reports.fields.account"}
        value={state.accountId ?? undefined}
        path={selectListEndpoints.chartAccountsSelectList}
        clearable
        search
        marginBottom="0"
        optionLabel={chartAccountOptionLabel}
        selectedLabel={chartAccountSelectedLabel}
        onChange={(value) => set({ accountId: typeof value === "number" ? value : null, ...(state.report === "subkonto-balance" ? { subkontoTypeId: null } : {}) })}
      />
    </div>
  );

  const renderReport = () => {
    if (state.report === "reconciliation-act") {
      const d = reconciliation.data;
      if (!state.counterpartyId) return <Empty description={t("app.analyticReports.reconciliation.pickCounterparty")} />;
      const sideValues = (v: number) => [v > 0 ? v : null, v < 0 ? -v : null];
      const columns: ColumnsType<ReconciliationActRow> = [
        { title: t("app.analyticReports.date"), width: 110, render: (_, row) => dayjs(row.date).format("DD.MM.YYYY") },
        { title: t("app.analyticReports.document"), render: (_, row) => `${row.documentType ?? ""} №${row.number ?? row.documentId}` },
        { title: t("app.analyticReports.debit"), width: 160, align: "right", render: (_, row) => num(row.debit) },
        { title: t("app.analyticReports.credit"), width: 160, align: "right", render: (_, row) => num(row.credit) },
      ];
      return (
        <div className="space-y-3">
          {d && (
            <div className="text-center text-sm">
              <div>{t("app.analyticReports.reconciliation.between", { org: d.organizationName, cp: d.counterpartyName })}</div>
              {d.contractName && (
                <div className="text-secondary-text">
                  {t("app.analyticReports.reconciliation.contract")}: {d.contractName}
                </div>
              )}
            </div>
          )}
          <Table<ReconciliationActRow>
            size="small"
            bordered
            pagination={false}
            rowKey={(row) => `${row.documentTypeId}-${row.documentId}`}
            columns={columns}
            dataSource={d?.rows ?? []}
            summary={() =>
              d && (
                <>
                  <TotalRow label={t("app.analyticReports.opening")} values={sideValues(d.openingBalance)} offset={2} />
                  <TotalRow label={t("app.analyticReports.turnover")} values={[d.totalDebit, d.totalCredit]} offset={2} />
                  <TotalRow label={t("app.analyticReports.closing")} values={sideValues(d.closingBalance)} offset={2} />
                </>
              )
            }
          />
          {d && (
            <Alert
              type={d.closingBalance === 0 ? "success" : "info"}
              showIcon
              message={
                d.closingBalance === 0
                  ? t("app.analyticReports.reconciliation.noDebt", { date: dayjs(d.dateTo).format("DD.MM.YYYY") })
                  : t("app.analyticReports.reconciliation.debtInFavour", {
                      date: dayjs(d.dateTo).format("DD.MM.YYYY"),
                      name: d.closingBalance > 0 ? d.organizationName : d.counterpartyName,
                      amount: money(Math.abs(d.closingBalance)),
                    })
              }
            />
          )}
        </div>
      );
    }
    if (state.report === "subkonto-balance") {
      const d = balance.data;
      if (!state.accountId || !state.subkontoTypeId) return <Empty description={t("app.analyticReports.pickAccountAndKind")} />;
      const columns: ColumnsType<SubkontoBalanceRow> = [
        { title: d?.subkontoTypeName ?? "", dataIndex: "name", fixed: "left", width: 280 },
        ...balanceColumns<SubkontoBalanceRow>(t, (x) => x.balance),
      ];
      return (
        <Table<SubkontoBalanceRow>
          size="small"
          bordered
          pagination={false}
          rowKey={(row) => String(row.entityId)}
          columns={columns}
          dataSource={d?.rows ?? []}
          scroll={{ x: "max-content" }}
          summary={() => d && <TotalRow label={t("app.analyticReports.total")} values={balanceCells(d.total)} />}
        />
      );
    }
    if (state.report === "account-analysis") {
      const d = analysis.data;
      if (!state.accountId) return <Empty description={t("app.analyticReports.pickAccount")} />;
      const columns: ColumnsType<AccountAnalysisRow> = [
        { title: t("app.analyticReports.correspondent"), dataIndex: "accountNumber", width: 110 },
        { title: t("app.analyticReports.accountName"), dataIndex: "accountName" },
        { title: t("app.analyticReports.debit"), width: 160, align: "right", render: (_, row) => num(row.debit) },
        { title: t("app.analyticReports.credit"), width: 160, align: "right", render: (_, row) => num(row.credit) },
      ];
      return (
        <Table<AccountAnalysisRow>
          size="small"
          bordered
          pagination={false}
          rowKey="accountNumber"
          columns={columns}
          dataSource={d?.rows ?? []}
          summary={() =>
            d && (
              <>
                <TotalRow label={t("app.analyticReports.opening")} values={[d.total.openingDebit, d.total.openingCredit]} offset={2} />
                <TotalRow label={t("app.analyticReports.turnover")} values={[d.total.debit, d.total.credit]} offset={2} />
                <TotalRow label={t("app.analyticReports.closing")} values={[d.total.closingDebit, d.total.closingCredit]} offset={2} />
              </>
            )
          }
        />
      );
    }
    if (state.report === "subkonto-card") {
      const d = card.data;
      if (!state.subkontoTypeId || !state.entityId) return <Empty description={t("app.analyticReports.pickValue")} />;
      const columns: ColumnsType<SubkontoCardRow> = [
        { title: t("app.analyticReports.date"), width: 105, render: (_, row) => dayjs(row.date).format("DD.MM.YYYY") },
        { title: t("app.analyticReports.document"), width: 220, render: (_, row) => `${row.documentType ?? ""} №${row.number ?? row.documentId}` },
        { title: t("app.analyticReports.content"), dataIndex: "content", width: 200 },
        { title: t("app.analyticReports.debitAccount"), dataIndex: "debitAccount", width: 90, align: "center" },
        { title: t("app.analyticReports.creditAccount"), dataIndex: "creditAccount", width: 90, align: "center" },
        { title: t("app.analyticReports.debit"), width: 140, align: "right", render: (_, row) => num(row.debit) },
        { title: t("app.analyticReports.credit"), width: 140, align: "right", render: (_, row) => num(row.credit) },
        { title: t("app.analyticReports.balance"), width: 170, align: "right", render: (_, row) => sided(row.balance, "Dt", "Kt") },
      ];
      return (
        <div className="space-y-3">
          {d?.truncated && <Alert type="warning" showIcon message={t("app.analyticReports.truncated")} />}
          <Table<SubkontoCardRow>
            size="small"
            bordered
            pagination={{ pageSize: 100, showSizeChanger: false }}
            rowKey="entryId"
            columns={columns}
            dataSource={d?.rows ?? []}
            scroll={{ x: "max-content" }}
            summary={() =>
              d && (
                <>
                  <Table.Summary.Row className="bg-primary-bg">
                    <Table.Summary.Cell index={0} colSpan={7}>
                      <span className="font-semibold">{t("app.analyticReports.opening")}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right">
                      {sided(d.openingBalance, "Dt", "Kt")}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row className="bg-primary-bg">
                    <Table.Summary.Cell index={0} colSpan={5}>
                      <span className="font-semibold">{t("app.analyticReports.closing")}</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">{bold(d.totalDebit)}</Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">{bold(d.totalCredit)}</Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right">
                      {sided(d.closingBalance, "Dt", "Kt")}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )
            }
          />
        </div>
      );
    }
    if (state.report === "general-ledger") {
      const d = ledger.data;
      type Row = { key: string; label: string; balance: AnalyticBalance; muted?: boolean; children?: Row[] };
      const rows: Row[] = (d?.accounts ?? []).map((a: GeneralLedgerAccount) => ({
        key: a.accountNumber,
        label: `${a.accountNumber} ${a.accountName}${a.isOffBalance ? ` (${t("app.analyticReports.offBalance")})` : ""}`,
        balance: a.total,
        muted: a.isOffBalance,
        children: a.months.map((m) => ({
          key: `${a.accountNumber}-${m.year}-${m.month}`,
          label: dayjs(new Date(m.year, m.month - 1, 1)).format("MMMM YYYY"),
          balance: m.balance,
        })),
      }));
      return (
        <Table<Row>
          size="small"
          bordered
          pagination={false}
          columns={[
            { title: t("app.analyticReports.account"), dataIndex: "label", fixed: "left", width: 320, render: (v: string, row) => <span className={row.muted ? "text-secondary-text" : ""}>{v}</span> },
            ...balanceColumns<Row>(t, (x) => x.balance),
          ]}
          dataSource={rows}
          scroll={{ x: "max-content" }}
          summary={() => d && <TotalRow label={t("app.analyticReports.total")} values={balanceCells(d.total)} />}
        />
      );
    }
    const d = chess.data;
    if (!d) return null;
    const cell = new Map(d.cells.map((c) => [`${c.debit}|${c.credit}`, c.amount]));
    type ChessRow = { number: string; name: string };
    const columns: ColumnsType<ChessRow> = [
      { title: `${t("app.analyticReports.debit")} \\ ${t("app.analyticReports.credit")}`, dataIndex: "number", fixed: "left", width: 110, render: (v: string, row) => <span title={row.name} className="font-medium">{v}</span> },
      ...d.creditAccounts.map((c) => ({
        title: <span title={c.name}>{c.number}</span>,
        key: c.number,
        width: 130,
        align: "right" as const,
        render: (_: unknown, row: ChessRow) => num(cell.get(`${row.number}|${c.number}`)),
      })),
      {
        title: t("app.analyticReports.total"),
        key: "total",
        width: 150,
        align: "right" as const,
        fixed: "right" as const,
        render: (_: unknown, row: ChessRow) => bold(d.cells.filter((x) => x.debit === row.number).reduce((s, x) => s + x.amount, 0)),
      },
    ];
    return (
      <Table<ChessRow>
        size="small"
        bordered
        pagination={false}
        rowKey="number"
        columns={columns}
        dataSource={d.debitAccounts}
        scroll={{ x: "max-content" }}
        summary={() => (
          <TotalRow
            label={t("app.analyticReports.total")}
            values={[...d.creditAccounts.map((c) => d.cells.filter((x) => x.credit === c.number).reduce((s, x) => s + x.amount, 0)), d.total]}
          />
        )}
      />
    );
  };

  return (
    <AccountingReportPageShell>
      <div className="space-y-3 rounded-xl border border-border bg-card p-3">
        <Segmented<ReportKind>
          value={state.report}
          onChange={(report) => set({ report })}
          options={(["subkonto-balance", "account-analysis", "subkonto-card", "general-ledger", "chess-sheet", "reconciliation-act"] as ReportKind[]).map((value) => ({
            value,
            label: t(`app.analyticReports.kinds.${value}`),
          }))}
        />
        <div className="flex flex-wrap items-center gap-3">
          <DatePicker.RangePicker
            allowClear={false}
            format="DD.MM.YYYY"
            value={[dayjs(state.dateFrom), dayjs(state.dateTo)]}
            onChange={(range) => {
              const [from, to] = (range ?? []) as [Dayjs | null, Dayjs | null];
              if (from && to) set({ dateFrom: from.format("YYYY-MM-DD"), dateTo: to.format("YYYY-MM-DD") });
            }}
          />
          {state.report === "subkonto-balance" && (
            <>
              {accountSelect(false)}
              <Select
                className="w-64"
                placeholder={t("app.analyticReports.subkontoKind")}
                value={state.subkontoTypeId ?? undefined}
                loading={types.isFetching}
                options={(types.data ?? []).map((x) => ({ value: x.id, label: x.name }))}
                onChange={(subkontoTypeId: number) => set({ subkontoTypeId })}
                notFoundContent={t("app.analyticReports.noKinds")}
              />
            </>
          )}
          {state.report === "account-analysis" && accountSelect(false)}
          {state.report === "subkonto-card" && (
            <>
              <div className="w-60">
                <SelectCustom
                  placeholder="app.analyticReports.subkontoKind"
                  value={state.subkontoTypeId ?? undefined}
                  path={selectListEndpoints.subkontoTypes}
                  search
                  marginBottom="0"
                  onChange={(value) => set({ subkontoTypeId: typeof value === "number" ? value : null, entityId: null })}
                />
              </div>
              {state.subkontoTypeId && (
                <div className="w-72">
                  <SelectCustom
                    key={state.subkontoTypeId}
                    placeholder="app.analyticReports.value"
                    value={state.entityId ?? undefined}
                    path={`subkonto-values/${state.subkontoTypeId}`}
                    search
                    clearable
                    marginBottom="0"
                    onChange={(value) => set({ entityId: typeof value === "number" ? value : null })}
                  />
                </div>
              )}
              {accountSelect(true)}
            </>
          )}
          {state.report === "reconciliation-act" && (
            <>
              <div className="w-72">
                <SelectCustom
                  placeholder="app.analyticReports.reconciliation.counterparty"
                  value={state.counterpartyId ?? undefined}
                  path={selectListEndpoints.counterpartiesSelectList}
                  displayConfig={counterpartySelectDisplayConfig}
                  search
                  clearable
                  marginBottom="0"
                  onChange={(value) => set({ counterpartyId: typeof value === "number" ? value : null, contractId: null })}
                />
              </div>
              <div className="w-60">
                <ContractSelect
                  placeholder="app.analyticReports.reconciliation.allContracts"
                  counterpartyId={state.counterpartyId}
                  date={null}
                  allowCreate={false}
                  value={state.contractId ?? undefined}
                  clearable
                  marginBottom="0"
                  onChange={(value) => set({ contractId: typeof value === "number" ? value : null })}
                />
              </div>
            </>
          )}
          {(state.report === "general-ledger" || state.report === "chess-sheet") && (
            <label className="flex items-center gap-2 text-sm">
              <Switch size="small" checked={state.detailed} onChange={(detailed) => set({ detailed })} />
              {t("app.analyticReports.detailed")}
            </label>
          )}
          <div className="ml-auto flex gap-2">
            <Button icon={<RefreshCw className="size-4" />} onClick={() => void active.refetch()} loading={active.isFetching} />
            {state.report === "reconciliation-act" && (
              <Button icon={<Printer className="size-4" />} disabled={!reconciliation.data} onClick={() => reconciliation.data && printReconciliation(reconciliation.data, t)}>
                {t("app.analyticReports.print")}
              </Button>
            )}
            <Button icon={<FileSpreadsheet className="size-4" />} onClick={handleExport} disabled={!active.data}>
              Excel
            </Button>
          </div>
        </div>
      </div>
      <Spin spinning={active.isFetching}>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 text-center">
            <div className="text-base font-semibold">{t(`app.analyticReports.kinds.${state.report}`)}</div>
            <div className="text-sm text-secondary-text">{periodText}</div>
          </div>
          {renderReport()}
        </div>
      </Spin>
    </AccountingReportPageShell>
  );
}
