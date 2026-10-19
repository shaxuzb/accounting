import { Alert, Button, DatePicker, Drawer, Select, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { FileSpreadsheet, ListTree, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import AccountingReportPageShell from "../accounting-report/components/AccountingReportPageShell";
import {
  useCashFlowItems,
  useRegulatedCashFlow,
  useSetCashFlowItemLine,
  type CashFlowItem,
  type RegulatedCashFlowLine,
  type RegulatedCurrencyLine,
} from "./api";
import { exportForm, formAmount, FormHeader, UnitSwitch } from "./shared";

/** The lines a cash flow item can go to (1C «Вид движения»), as the server accepts them. */
const ITEM_LINES = ["000", "010", "020", "030", "040", "060", "070", "080", "090", "110", "120", "130", "140", "150", "160", "170", "190", "200"];

/** The cash flow items and the line of the statement each goes to (1C «Статьи движения денежных средств»). */
function CashFlowItemsDrawer({ open, onClose, lineNames }: { open: boolean; onClose: () => void; lineNames: Map<string, string> }) {
  const { t } = useTranslation();
  const items = useCashFlowItems(open);
  const setLine = useSetCashFlowItemLine();
  const options = [
    { value: "", label: t("app.regulatedForms.cashFlowByAccount") },
    ...ITEM_LINES.map((code) => ({
      value: code,
      label: code === "000" ? t("app.regulatedForms.cashFlowInternal") : `${code} — ${lineNames.get(code) ?? ""}`,
    })),
  ];

  const columns: ColumnsType<CashFlowItem> = [
    { title: t("app.regulatedForms.cashFlowItem"), dataIndex: "name", width: 240 },
    {
      title: t("app.regulatedForms.cashFlowLine"),
      render: (_, item) => (
        <Select
          className="w-full"
          value={item.line ?? ""}
          options={options}
          popupMatchSelectWidth={false}
          loading={setLine.isPending && setLine.variables?.id === item.id}
          onChange={(value: string) =>
            setLine.mutate({ id: item.id, line: value || null }, { onError: (error) => errorHandlers(error) })
          }
        />
      ),
    },
  ];

  return (
    <Drawer open={open} onClose={onClose} width={760} title={t("app.regulatedForms.cashFlowItems")}>
      <Alert className="mb-3" type="info" showIcon message={t("app.regulatedForms.cashFlowItemsHint")} />
      <Table<CashFlowItem>
        size="small"
        bordered
        rowKey="id"
        tableLayout="fixed"
        pagination={false}
        loading={items.isFetching}
        columns={columns}
        dataSource={items.data ?? []}
      />
    </Drawer>
  );
}

/** Form 4 «Pul oqimlari to'g'risida hisobot» by cash flow item (order No. 3567, annex 4). */
export default function RegulatedCashFlowPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "regulated-cash-flow");
  const [state, setState] = usePersistedState<{ year: number; monthTo: number; unit: number }>(
    key,
    { year: dayjs().year(), monthTo: dayjs().month() + 1, unit: 1000 },
    { debounceMs: 0 },
  );
  const [itemsOpen, setItemsOpen] = useState(false);
  const query = useRegulatedCashFlow(state);
  const data = query.data;
  const period = data ? `${dayjs(data.dateFrom).format("DD.MM.YYYY")} — ${dayjs(data.dateTo).format("DD.MM.YYYY")}` : "";
  const unitText = state.unit === 1000 ? t("app.regulatedForms.unitThousandFull") : t("app.regulatedForms.unitSumFull");
  const lineNames = new Map((data?.lines ?? []).map((x) => [x.code, x.name]));

  const amount = (value: number | null, row: RegulatedCashFlowLine) =>
    row.isSection ? null : (
      <span className={`tabular-nums ${row.isTotal ? "font-semibold" : ""}`}>{formAmount(value, state.unit)}</span>
    );

  const columns: ColumnsType<RegulatedCashFlowLine> = [
    {
      title: t("app.regulatedForms.indicator"),
      dataIndex: "name",
      render: (value: string, row) => (
        <span className={row.isTotal || row.isSection ? "font-semibold" : ""} style={{ paddingLeft: row.level > 0 ? 20 : 0 }}>
          {value}
        </span>
      ),
    },
    { title: t("app.regulatedForms.lineCode"), dataIndex: "code", width: 80, align: "center", render: (code: string, row) => (row.isSection ? "" : code) },
    { title: t("app.regulatedForms.inflow"), width: 160, align: "right", render: (_, row) => amount(row.inflow, row) },
    { title: t("app.regulatedForms.outflow"), width: 160, align: "right", render: (_, row) => amount(row.outflow, row) },
  ];

  const currencyColumns: ColumnsType<RegulatedCurrencyLine> = [
    {
      title: t("app.regulatedForms.indicator"),
      dataIndex: "name",
      render: (value: string, row) => (
        <span className={row.level === 0 ? "font-semibold" : ""} style={{ paddingLeft: row.level > 1 ? 20 : 0 }}>
          {value}
        </span>
      ),
    },
    { title: t("app.regulatedForms.lineCode"), dataIndex: "code", width: 80, align: "center" },
    {
      title: t("app.regulatedForms.amount"),
      width: 160,
      align: "right",
      render: (_, row) => <span className="tabular-nums">{formAmount(row.amount, state.unit)}</span>,
    },
  ];

  const handleExport = () => {
    if (!data) return;
    exportForm(
      `4-shakl-pul-oqimlari-${state.year}-${String(state.monthTo).padStart(2, "0")}.xlsx`,
      [
        t("app.regulatedForms.cashFlowTitle"),
        period,
        `${t("app.regulatedForms.organization")}: ${data.header.organizationName}`,
        `${t("app.regulatedForms.inn")}: ${data.header.inn ?? ""}`,
        unitText,
      ],
      [t("app.regulatedForms.indicator"), t("app.regulatedForms.lineCode"), t("app.regulatedForms.inflow"), t("app.regulatedForms.outflow")],
      [
        ...data.lines.map((x) => [x.name, x.isSection ? "" : x.code, x.isSection ? null : x.inflow, x.isSection ? null : x.outflow]),
        [],
        [t("app.regulatedForms.currencyMovement")],
        ...data.currencyLines.map((x) => [x.name, x.code, x.amount, null]),
      ],
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
          <Button icon={<ListTree className="size-4" />} onClick={() => setItemsOpen(true)}>
            {t("app.regulatedForms.cashFlowItems")}
          </Button>
          <Button icon={<RefreshCw className="size-4" />} onClick={() => void query.refetch()} loading={query.isFetching} />
          <Button icon={<FileSpreadsheet className="size-4" />} onClick={handleExport} disabled={!data}>
            Excel
          </Button>
        </div>
      </div>

      <Spin spinning={query.isFetching}>
        <div className="space-y-3">
          {data && !data.isBalanced && <Alert type="error" showIcon message={t("app.regulatedForms.cashFlowNotBalanced")} />}
          {data && data.withoutItem !== 0 && (
            <Alert
              type="info"
              showIcon
              message={t("app.regulatedForms.cashFlowWithoutItem", { amount: formAmount(data.withoutItem, state.unit) })}
            />
          )}
          <FormHeader header={data?.header} title={t("app.regulatedForms.cashFlowTitle")} subtitle={`${period} · ${unitText}`} />
          <Table<RegulatedCashFlowLine>
            size="small"
            bordered
            pagination={false}
            rowKey="code"
            columns={columns}
            dataSource={data?.lines ?? []}
            rowClassName={(row) => (row.isSection ? "bg-(--theme-bg-muted)" : row.isTotal ? "bg-primary-bg" : "")}
            scroll={{ x: "max-content" }}
          />
          <div className="rounded-xl border border-border bg-card p-3 text-center font-semibold">{t("app.regulatedForms.currencyMovement")}</div>
          <Table<RegulatedCurrencyLine>
            size="small"
            bordered
            pagination={false}
            rowKey="code"
            columns={currencyColumns}
            dataSource={data?.currencyLines ?? []}
            rowClassName={(row) => (row.level === 0 ? "bg-primary-bg" : "")}
            scroll={{ x: "max-content" }}
          />
        </div>
      </Spin>

      <CashFlowItemsDrawer open={itemsOpen} onClose={() => setItemsOpen(false)} lineNames={lineNames} />
    </AccountingReportPageShell>
  );
}
