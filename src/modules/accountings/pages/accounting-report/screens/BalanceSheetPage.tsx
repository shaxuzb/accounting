import { Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useFormik } from "formik";
import { Landmark, Layers3, PiggyBank, Scale } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";
import {
  usePersistedState,
  useScopedStorageKey,
} from "@/shared/persistence/usePersistedState";
import AccountingReportFilterBar from "../components/AccountingReportFilterBar";
import { exportReportTable, printReportTable, reportPeriodText, type ReportTable } from "../utils/reportOutput";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetBalanceSheet } from "../hooks";
import type { BalanceSheetQuery, BalanceSheetRow } from "../types/type";

const initialValues: BalanceSheetQuery = { dateFrom: "", dateTo: "" };
const money = (value: number) => numberSpacing(value, undefined, true);

export default function BalanceSheetPage() {
  const { t } = useTranslation();
  const filtersKey = useScopedStorageKey("report-state", "balance-sheet");
  const [filters, setFilters] = usePersistedState<BalanceSheetQuery>(
    filtersKey,
    {},
    { debounceMs: 0 },
  );
  const query = useGetBalanceSheet(filters);
  const formik = useFormik<BalanceSheetQuery>({
    initialValues: { ...initialValues, ...filters },
    enableReinitialize: true,
    onSubmit: (values) => setFilters(values),
  });

  const columns = useMemo<ColumnsType<BalanceSheetRow>>(
    () => [
      {
        title: t("app.reports.fields.accountCode"),
        width: 120,
        render: (_value, row) => (
          <span className="inline-flex rounded-md bg-brand-soft px-2 py-1 font-medium text-brand-text">
            {row.accountNumber || row.accountCode || "-"}
          </span>
        ),
      },
      {
        title: t("app.reports.fields.accountName"),
        dataIndex: "accountName",
        width: 280,
      },
      {
        title: t("app.reports.fields.balance"),
        dataIndex: "balance",
        align: "right",
        width: 170,
        render: (value) => (
          <span className="font-semibold tabular-nums">{money(value)}</span>
        ),
      },
    ],
    [t],
  );

  const data = query.data;
  const assets = data?.sections.find((section) => section.code === "ASSETS");
  const liabilities = data?.sections.find(
    (section) => section.code === "LIABILITIES",
  );
  const equity = data?.sections.find((section) => section.code === "EQUITY");
  // the server decides whether the balance sheet agrees
  const difference = data?.difference ?? 0;
  const isBalanced = data?.isBalanced ?? true;

  const sectionNames: Record<string, string> = {
    ASSETS: t("app.reports.balance.assets"),
    LIABILITIES: t("app.reports.balance.liabilities"),
    EQUITY: t("app.reports.balance.equity"),
  };
  const outputTable = (): ReportTable | null => {
    if (!data) return null;
    const rows: (string | number | null)[][] = [];
    const boldRows: number[] = [];
    for (const section of data.sections) {
      boldRows.push(rows.length);
      rows.push([sectionNames[section.code] ?? section.name, "", section.total ?? section.rows.reduce((s, r) => s + r.balance, 0)]);
      section.rows.forEach((row) => rows.push([row.accountNumber, row.accountName, row.balance]));
    }
    boldRows.push(rows.length);
    rows.push([t("app.reports.summary.totalAssets"), "", data.totalAssets]);
    boldRows.push(rows.length);
    rows.push([t("app.reports.summary.liabilitiesAndEquity"), "", data.totalLiabilitiesAndEquity]);
    return {
      fileName: `balans-${filters.dateTo ?? ""}.xlsx`,
      title: t("app.reports.balance.title"),
      headerLines: [reportPeriodText(data.dateFrom, data.dateTo)],
      columns: [t("app.reports.fields.account"), t("app.reports.fields.accountName"), t("app.reports.fields.balance")],
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
          {!isBalanced && Math.abs(data.openingOffsetBalance ?? 0) >= 0.01 && (
            <Alert
              type="warning"
              showIcon
              message={t("app.reports.balance.openingOffset", {
                amount: money(Math.abs(data.openingOffsetBalance ?? 0)),
              })}
            />
          )}
          <AccountingReportSummaryGrid
            compact
            items={[
              {
                label: t("app.reports.summary.totalAssets"),
                value: money(data.totalAssets),
                icon: <Layers3 className="size-4" />,
                tone: "primary",
              },
              {
                label: t("app.reports.summary.totalLiabilities"),
                value: money(data.totalLiabilities),
                icon: <Landmark className="size-4" />,
                tone: "violet",
              },
              {
                label: t("app.reports.summary.totalEquity"),
                value: money(data.totalEquity),
                icon: <PiggyBank className="size-4" />,
                tone: "success",
              },
              {
                label: t("app.reports.summary.balanceDifference"),
                value: money(Math.abs(difference)),
                helper: t(
                  isBalanced
                    ? "app.reports.balance.balanced"
                    : "app.reports.balance.notBalanced",
                ),
                icon: <Scale className="size-4" />,
                tone: isBalanced ? "success" : "warning",
              },
            ]}
          />

          <div className="grid items-start gap-4 xl:grid-cols-2">
            <AccountingReportSectionCard
              title={t("app.reports.balance.assets")}
              total={money(assets?.total ?? 0)}
              columns={columns}
              dataSource={assets?.rows ?? []}
              emptyText={t("app.reports.balance.empty")}
              tone="primary"
              rowKey={(row) => row.accountId ?? row.accountNumber}
            />
            <div className="grid gap-4">
              <AccountingReportSectionCard
                title={t("app.reports.balance.liabilities")}
                total={money(liabilities?.total ?? 0)}
                columns={columns}
                dataSource={liabilities?.rows ?? []}
                emptyText={t("app.reports.balance.empty")}
                tone="violet"
                rowKey={(row) => row.accountId ?? row.accountNumber}
              />
              <AccountingReportSectionCard
                title={t("app.reports.balance.equity")}
                total={money(equity?.total ?? 0)}
                columns={columns}
                dataSource={equity?.rows ?? []}
                emptyText={t("app.reports.balance.empty")}
                tone="success"
                rowKey={(row) => row.accountId ?? row.accountNumber}
              />
            </div>
          </div>
        </>
      )}
    </AccountingReportPageShell>
  );
}
