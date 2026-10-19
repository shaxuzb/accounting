import type { ColumnsType } from "antd/es/table";
import { useFormik } from "formik";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import AccountingReportFilterBar from "../components/AccountingReportFilterBar";
import { exportReportTable, printReportTable, reportPeriodText, type ReportTable } from "../utils/reportOutput";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetCashFlow } from "../hooks";
import type { CashFlowQuery, CashFlowRow } from "../types/type";

const initialValues: CashFlowQuery = { dateFrom: "", dateTo: "" };
const money = (value: number) => numberSpacing(value, undefined, true);

export default function CashFlowPage() {
  const { t } = useTranslation();
  const filtersKey = useScopedStorageKey("report-state", "cash-flow");
  const [filters, setFilters] = usePersistedState<CashFlowQuery>(
    filtersKey,
    {},
    { debounceMs: 0 },
  );
  const query = useGetCashFlow(filters);
  const formik = useFormik<CashFlowQuery>({
    initialValues: { ...initialValues, ...filters },
    enableReinitialize: true,
    onSubmit: (values) => setFilters(values),
  });

  const columns = useMemo<ColumnsType<CashFlowRow>>(
    () => [
      {
        title: t("app.reports.fields.counterpartAccount"),
        dataIndex: "counterpartAccountCode",
        width: 150,
        render: (value) => (
          <span className="inline-flex rounded-md bg-surface-muted px-2 py-1 font-medium text-text">
            {value || "-"}
          </span>
        ),
      },
      {
        title: t("app.reports.fields.accountName"),
        dataIndex: "counterpartAccountName",
        width: 280,
      },
      {
        title: t("app.reports.fields.cashFlowItem"),
        dataIndex: "cashFlowItemName",
        width: 240,
        render: (value: string | null) => value || "—",
      },
      {
        title: t("app.reports.fields.formLine"),
        dataIndex: "formLine",
        width: 90,
        align: "center",
      },
      {
        title: t("app.reports.fields.inflow"),
        dataIndex: "inflow",
        align: "right",
        width: 150,
        render: (value) => (
          <span className="text-success tabular-nums">{money(value)}</span>
        ),
      },
      {
        title: t("app.reports.fields.outflow"),
        dataIndex: "outflow",
        align: "right",
        width: 150,
        render: (value) => (
          <span className="text-danger tabular-nums">{money(value)}</span>
        ),
      },
      {
        title: t("app.reports.fields.net"),
        dataIndex: "net",
        align: "right",
        width: 150,
        render: (value) => (
          <span className="font-semibold tabular-nums">{money(value)}</span>
        ),
      },
    ],
    [t],
  );

  const data = query.data;
  const totalInflow =
    data?.sections.reduce((sum, section) => sum + (section.inflow ?? 0), 0) ?? 0;
  const totalOutflow =
    data?.sections.reduce((sum, section) => sum + (section.outflow ?? 0), 0) ?? 0;
  const sectionTitles: Record<string, string> = {
    OPERATING: t("app.reports.cashFlow.operating"),
    INVESTING: t("app.reports.cashFlow.investing"),
    FINANCING: t("app.reports.cashFlow.financing"),
    EXCHANGE_EFFECT: t("app.reports.cashFlow.exchangeEffect"),
  };
  const outputTable = (): ReportTable | null => {
    if (!data) return null;
    const rows: (string | number | null)[][] = [];
    const boldRows: number[] = [];
    boldRows.push(rows.length);
    rows.push([t("app.reports.summary.openingCashBalance"), "", "", null, null, data.openingCashBalance]);
    for (const section of data.sections) {
      boldRows.push(rows.length);
      rows.push([sectionTitles[section.code] ?? section.name, "", "", section.inflow ?? 0, section.outflow ?? 0, (section.inflow ?? 0) - (section.outflow ?? 0)]);
      section.rows.forEach((row) =>
        rows.push([row.counterpartAccountCode ?? "", row.counterpartAccountName, row.cashFlowItemName ?? "", row.inflow, row.outflow, row.net]),
      );
    }
    boldRows.push(rows.length);
    rows.push([t("app.reports.summary.closingCashBalance"), "", "", totalInflow, totalOutflow, data.closingCashBalance]);
    return {
      fileName: `pul-oqimi-${filters.dateFrom ?? ""}-${filters.dateTo ?? ""}.xlsx`,
      title: t("app.reports.cashFlow.title"),
      headerLines: [reportPeriodText(data.dateFrom, data.dateTo)],
      columns: [
        t("app.reports.fields.counterpartAccount"),
        t("app.reports.fields.accountName"),
        t("app.reports.fields.cashFlowItem"),
        t("app.reports.fields.inflow"),
        t("app.reports.fields.outflow"),
        t("app.reports.fields.net"),
      ],
      rows,
      boldRows,
    };
  };

  return (
    <AccountingReportPageShell>
      <AccountingReportFilterBar
        formik={formik}
        loading={query.isFetching}
        onDateChange={(dateFrom, dateTo) => setFilters({ dateFrom, dateTo })}
        onRefresh={() => void query.refetch()}
        outputDisabled={!data}
        onExcel={() => { const table = outputTable(); if (table) exportReportTable(table); }}
        onPrint={() => { const table = outputTable(); if (table) printReportTable(table); }}
      />

      {data && (
        <>
          <AccountingReportSummaryGrid
            items={[
              {
                label: t("app.reports.summary.openingCashBalance"),
                value: money(data.openingCashBalance),
                icon: <Wallet className="size-4" />,
                tone: "primary",
              },
              {
                label: t("app.reports.summary.totalInflow"),
                value: money(totalInflow),
                icon: <ArrowDownToLine className="size-4" />,
                tone: "success",
              },
              {
                label: t("app.reports.summary.totalOutflow"),
                value: money(totalOutflow),
                icon: <ArrowUpFromLine className="size-4" />,
                tone: "danger",
              },
              {
                label: t("app.reports.summary.closingCashBalance"),
                value: money(data.closingCashBalance),
                icon: <CircleDollarSign className="size-4" />,
                tone: "success",
              },
            ]}
          />

          <div className="grid items-start gap-4 xl:grid-cols-2">
            {data.sections.map((section) => (
              <AccountingReportSectionCard
                key={section.code}
                title={sectionTitles[section.code] ?? section.name}
                columns={columns}
                dataSource={section.rows}
                emptyText={t("app.reports.cashFlow.empty")}
                tone={(section.net ?? 0) < 0 ? "danger" : "primary"}
                metrics={[
                  {
                    label: t("app.reports.fields.inflow"),
                    value: money(section.inflow ?? 0),
                    tone: "success",
                  },
                  {
                    label: t("app.reports.fields.outflow"),
                    value: money(section.outflow ?? 0),
                    tone: "danger",
                  },
                  {
                    label: t("app.reports.fields.net"),
                    value: money(section.net ?? 0),
                    tone: (section.net ?? 0) < 0 ? "danger" : "default",
                  },
                ]}
              />
            ))}
          </div>
        </>
      )}
    </AccountingReportPageShell>
  );
}
