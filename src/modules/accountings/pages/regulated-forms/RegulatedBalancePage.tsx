import { Alert, Button, DatePicker, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import AccountingReportPageShell from "../accounting-report/components/AccountingReportPageShell";
import { useRegulatedBalance, type RegulatedBalanceLine } from "./api";
import { exportForm, formAmount, FormHeader, UnitSwitch } from "./shared";

/** Form 1 «Buxgalteriya balansi» with the official line codes (order No. 3567, annex 1). */
export default function RegulatedBalancePage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "regulated-balance");
  const [state, setState] = usePersistedState<{ dateTo: string; unit: number }>(
    key,
    { dateTo: dayjs().format("YYYY-MM-DD"), unit: 1000 },
    { debounceMs: 0 },
  );
  const query = useRegulatedBalance(state);
  const data = query.data;
  const startLabel = data ? dayjs(data.startDate).format("DD.MM.YYYY") : "";
  const endLabel = data ? dayjs(data.endDate).format("DD.MM.YYYY") : "";
  const assets = data?.lines.find((x) => x.code === "400");
  const passive = data?.lines.find((x) => x.code === "780");
  const balanced = !data || (assets?.end === passive?.end && assets?.start === passive?.start);

  const columns: ColumnsType<RegulatedBalanceLine> = [
    {
      title: t("app.regulatedForms.indicator"),
      dataIndex: "name",
      render: (value: string, row) => (
        <span
          className={row.isSection ? "font-semibold uppercase" : row.isTotal ? "font-semibold" : ""}
          style={{ paddingLeft: row.level > 1 ? 20 : 0 }}
        >
          {value}
        </span>
      ),
    },
    { title: t("app.regulatedForms.lineCode"), dataIndex: "code", width: 90, align: "center", render: (value: string, row) => (row.isSection ? "" : value) },
    {
      title: `${t("app.regulatedForms.periodStart")} (${startLabel})`,
      dataIndex: "start",
      width: 180,
      align: "right",
      render: (value: number | null, row) => <span className={`tabular-nums ${row.isTotal ? "font-semibold" : ""}`}>{formAmount(value, state.unit)}</span>,
    },
    {
      title: `${t("app.regulatedForms.periodEnd")} (${endLabel})`,
      dataIndex: "end",
      width: 180,
      align: "right",
      render: (value: number | null, row) => <span className={`tabular-nums ${row.isTotal ? "font-semibold" : ""}`}>{formAmount(value, state.unit)}</span>,
    },
  ];

  const handleExport = () => {
    if (!data) return;
    exportForm(
      `1-shakl-balans-${dayjs(data.endDate).format("YYYY-MM-DD")}.xlsx`,
      [
        t("app.regulatedForms.balanceTitle"),
        `${dayjs(data.endDate).format("DD.MM.YYYY")} ${t("app.regulatedForms.asOf")}`,
        `${t("app.regulatedForms.organization")}: ${data.header.organizationName}`,
        `${t("app.regulatedForms.inn")}: ${data.header.inn ?? ""}`,
        data.unit === 1000 ? t("app.regulatedForms.unitThousandFull") : t("app.regulatedForms.unitSumFull"),
      ],
      [t("app.regulatedForms.indicator"), t("app.regulatedForms.lineCode"), startLabel, endLabel],
      data.lines.map((x) => [x.name, x.isSection ? "" : x.code, x.start, x.end]),
    );
  };

  return (
    <AccountingReportPageShell>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <DatePicker
          value={state.dateTo ? dayjs(state.dateTo) : null}
          format="DD.MM.YYYY"
          allowClear={false}
          onChange={(value) => value && setState({ ...state, dateTo: value.format("YYYY-MM-DD") })}
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
          {data && (data.endOffset !== 0 || data.startOffset !== 0) && (
            <Alert type="warning" showIcon message={t("app.regulatedForms.offsetWarning", { amount: formAmount(data.endOffset || data.startOffset, 1) })} />
          )}
          {data && data.unmappedAccounts.length > 0 && (
            <Alert type="warning" showIcon message={t("app.regulatedForms.unmapped")} description={data.unmappedAccounts.join(", ")} />
          )}
          {data && !balanced && <Alert type="error" showIcon message={t("app.regulatedForms.notBalanced")} />}
          <FormHeader
            header={data?.header}
            title={t("app.regulatedForms.balanceTitle")}
            subtitle={`${endLabel} ${t("app.regulatedForms.asOf")} · ${state.unit === 1000 ? t("app.regulatedForms.unitThousandFull") : t("app.regulatedForms.unitSumFull")}`}
          />
          <Table<RegulatedBalanceLine>
            size="small"
            bordered
            pagination={false}
            rowKey="code"
            columns={columns}
            dataSource={data?.lines ?? []}
            rowClassName={(row) => (row.isSection ? "bg-brand-soft/40" : row.isTotal ? "bg-primary-bg" : "")}
          />
        </div>
      </Spin>
    </AccountingReportPageShell>
  );
}
