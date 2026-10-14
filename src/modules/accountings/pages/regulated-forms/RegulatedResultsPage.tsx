import { Alert, Button, DatePicker, Select, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import AccountingReportPageShell from "../accounting-report/components/AccountingReportPageShell";
import { useRegulatedResults, type RegulatedResultLine } from "./api";
import { exportForm, formAmount, FormHeader, UnitSwitch } from "./shared";

const cell = (open: boolean, value: number | null, unit: number, bold: boolean) =>
  open ? <span className={`tabular-nums ${bold ? "font-semibold" : ""}`}>{formAmount(value, unit)}</span> : <span className="text-secondary-text">x</span>;

/** Form 2 «Moliyaviy natijalar to'g'risidagi hisobot» with the official line codes (order No. 3567, annex 2). */
export default function RegulatedResultsPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "regulated-results");
  const [state, setState] = usePersistedState<{ year: number; monthTo: number; unit: number }>(
    key,
    { year: dayjs().year(), monthTo: dayjs().month() + 1, unit: 1000 },
    { debounceMs: 0 },
  );
  const query = useRegulatedResults(state);
  const data = query.data;
  const period = data ? `${dayjs(data.dateFrom).format("DD.MM.YYYY")} — ${dayjs(data.dateTo).format("DD.MM.YYYY")}` : "";
  const prior = data ? `${dayjs(data.priorDateFrom).format("DD.MM.YYYY")} — ${dayjs(data.priorDateTo).format("DD.MM.YYYY")}` : "";

  const columns: ColumnsType<RegulatedResultLine> = [
    {
      title: t("app.regulatedForms.indicator"),
      dataIndex: "name",
      render: (value: string, row) => (
        <span className={row.isTotal ? "font-semibold" : ""} style={{ paddingLeft: row.level > 1 ? 20 : 0 }}>
          {value}
        </span>
      ),
    },
    { title: t("app.regulatedForms.lineCode"), dataIndex: "code", width: 80, align: "center" },
    {
      title: `${t("app.regulatedForms.priorPeriod")} (${prior})`,
      children: [
        { title: t("app.regulatedForms.income"), width: 150, align: "right", render: (_, row) => cell(row.incomeOpen, row.priorIncome, state.unit, row.isTotal) },
        { title: t("app.regulatedForms.expense"), width: 150, align: "right", render: (_, row) => cell(row.expenseOpen, row.priorExpense, state.unit, row.isTotal) },
      ],
    },
    {
      title: `${t("app.regulatedForms.reportPeriod")} (${period})`,
      children: [
        { title: t("app.regulatedForms.income"), width: 150, align: "right", render: (_, row) => cell(row.incomeOpen, row.income, state.unit, row.isTotal) },
        { title: t("app.regulatedForms.expense"), width: 150, align: "right", render: (_, row) => cell(row.expenseOpen, row.expense, state.unit, row.isTotal) },
      ],
    },
  ];

  const handleExport = () => {
    if (!data) return;
    exportForm(
      `2-shakl-moliyaviy-natijalar-${state.year}-${String(state.monthTo).padStart(2, "0")}.xlsx`,
      [
        t("app.regulatedForms.resultsTitle"),
        period,
        `${t("app.regulatedForms.organization")}: ${data.header.organizationName}`,
        `${t("app.regulatedForms.inn")}: ${data.header.inn ?? ""}`,
        data.unit === 1000 ? t("app.regulatedForms.unitThousandFull") : t("app.regulatedForms.unitSumFull"),
      ],
      [
        t("app.regulatedForms.indicator"),
        t("app.regulatedForms.lineCode"),
        `${t("app.regulatedForms.priorPeriod")}: ${t("app.regulatedForms.income")}`,
        `${t("app.regulatedForms.priorPeriod")}: ${t("app.regulatedForms.expense")}`,
        `${t("app.regulatedForms.reportPeriod")}: ${t("app.regulatedForms.income")}`,
        `${t("app.regulatedForms.reportPeriod")}: ${t("app.regulatedForms.expense")}`,
      ],
      data.lines.map((x) => [
        x.name,
        x.code,
        x.incomeOpen ? x.priorIncome : "x",
        x.expenseOpen ? x.priorExpense : "x",
        x.incomeOpen ? x.income : "x",
        x.expenseOpen ? x.expense : "x",
      ]),
    );
  };

  return (
    <AccountingReportPageShell>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <DatePicker
          picker="year"
          value={dayjs(`${state.year}-01-01`)}
          allowClear={false}
          onChange={(value) => value && setState({ ...state, year: value.year() })}
        />
        <Select
          className="w-48"
          value={state.monthTo}
          onChange={(monthTo) => setState({ ...state, monthTo })}
          options={Array.from({ length: 12 }, (_, i) => ({
            value: i + 1,
            label: i === 11 ? t("app.regulatedForms.fullYear") : t("app.regulatedForms.untilMonth", { month: dayjs().month(i).format("MMMM") }),
          }))}
        />
        <UnitSwitch value={state.unit} onChange={(unit) => setState({ ...state, unit })} />
        <div className="ml-auto flex gap-2">
          <Button icon={<RefreshCw className="size-4" />} onClick={() => void query.refetch()} loading={query.isFetching} />
          <Button icon={<FileSpreadsheet className="size-4" />} onClick={handleExport} disabled={!data}>
            Excel
          </Button>
        </div>
      </div>

      <Spin spinning={query.isFetching}>
        <div className="space-y-3">
          {data?.turnoverTax && <Alert type="info" showIcon message={t("app.regulatedForms.turnoverNote")} />}
          <FormHeader
            header={data?.header}
            title={t("app.regulatedForms.resultsTitle")}
            subtitle={`${period} · ${state.unit === 1000 ? t("app.regulatedForms.unitThousandFull") : t("app.regulatedForms.unitSumFull")}`}
          />
          <Table<RegulatedResultLine>
            size="small"
            bordered
            pagination={false}
            rowKey="code"
            columns={columns}
            dataSource={data?.lines ?? []}
            rowClassName={(row) => (row.isTotal ? "bg-primary-bg" : "")}
            scroll={{ x: "max-content" }}
          />
        </div>
      </Spin>
    </AccountingReportPageShell>
  );
}
