import type { ColumnsType } from "antd/es/table";
import { useFormik } from "formik";
import {
  BadgeDollarSign,
  ChartNoAxesCombined,
  ReceiptText,
  WalletCards,
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
import { useGetIncomeStatement } from "../hooks";
import type { IncomeStatementQuery, IncomeStatementRow } from "../types/type";

const initialValues: IncomeStatementQuery = { dateFrom: "", dateTo: "" };
const money = (value: number) => numberSpacing(value, undefined, true);

const sectionTone = (code: string) => {
  if (code === "REVENUE" || code === "OTHER_INCOME" || code === "FINANCIAL_INCOME")
    return "success" as const;
  if (
    code === "COST_OF_SALES" ||
    code === "OTHER_EXPENSE" ||
    code === "FINANCIAL_EXPENSE" ||
    code === "INCOME_TAX"
  )
    return "danger" as const;
  if (code === "OPERATING_EXPENSE") return "warning" as const;
  return "default" as const;
};

export default function IncomeStatementPage() {
  const { t } = useTranslation();
  const filtersKey = useScopedStorageKey("report-state", "income-statement");
  const [filters, setFilters] = usePersistedState<IncomeStatementQuery>(
    filtersKey,
    {},
    { debounceMs: 0 },
  );
  const query = useGetIncomeStatement(filters);
  const formik = useFormik<IncomeStatementQuery>({
    initialValues: { ...initialValues, ...filters },
    enableReinitialize: true,
    onSubmit: (values) => setFilters(values),
  });

  const columns = useMemo<ColumnsType<IncomeStatementRow>>(
    () => [
      {
        title: t("app.reports.fields.accountCode"),
        width: 120,
        render: (_value, row) => (
          <span className="inline-flex rounded-md bg-surface-muted px-2 py-1 font-medium text-text">
            {row.accountNumber || row.accountCode || "-"}
          </span>
        ),
      },
      {
        title: t("app.reports.fields.accountName"),
        dataIndex: "accountName",
        width: 300,
      },
      {
        title: t("app.reports.fields.amount"),
        dataIndex: "amount",
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
  const sectionTitles: Record<string, string> = {
    REVENUE: t("app.reports.income.revenue"),
    COST_OF_SALES: t("app.reports.income.costOfSales"),
    OPERATING_EXPENSE: t("app.reports.income.operatingExpenses"),
    OTHER_INCOME: t("app.reports.income.otherIncome"),
    OTHER_EXPENSE: t("app.reports.income.otherExpenses"),
    FINANCIAL_INCOME: t("app.reports.income.financialIncome"),
    FINANCIAL_EXPENSE: t("app.reports.income.financialExpenses"),
    EXTRAORDINARY: t("app.reports.income.extraordinary"),
    INCOME_TAX: t("app.reports.income.incomeTax"),
  };
  const outputTable = (): ReportTable | null => {
    if (!data) return null;
    const rows: (string | number | null)[][] = [];
    const boldRows: number[] = [];
    for (const section of data.sections) {
      boldRows.push(rows.length);
      rows.push([sectionTitles[section.code] ?? section.name, "", section.total ?? section.rows.reduce((s, r) => s + r.amount, 0)]);
      section.rows.forEach((row) => rows.push([row.accountNumber ?? row.accountCode ?? "", row.accountName, row.amount]));
    }
    const totals: [string, number | undefined][] = [
      [t("app.reports.summary.grossProfit"), data.grossProfit],
      [t("app.reports.summary.operatingProfit"), data.operatingProfit],
      [t("app.reports.summary.generalActivityProfit"), data.generalActivityProfit],
      [t("app.reports.summary.profitBeforeTax"), data.profitBeforeTax],
      [t("app.reports.summary.netProfit"), data.netProfit],
    ];
    for (const [label, value] of totals) {
      if (value === undefined || value === null) continue;
      boldRows.push(rows.length);
      rows.push([label, "", value]);
    }
    return {
      fileName: `foyda-zarar-${filters.dateFrom ?? ""}-${filters.dateTo ?? ""}.xlsx`,
      title: t("app.reports.income.title"),
      headerLines: [reportPeriodText(data.dateFrom, data.dateTo)],
      columns: [t("app.reports.fields.account"), t("app.reports.fields.accountName"), t("app.reports.fields.amount")],
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
                label: t("app.reports.summary.revenue"),
                value: money(data.revenueTotal),
                icon: <BadgeDollarSign className="size-4" />,
                tone: "success",
              },
              {
                label: t("app.reports.summary.grossProfit"),
                value: money(data.grossProfit),
                icon: <WalletCards className="size-4" />,
                tone: data.grossProfit >= 0 ? "primary" : "danger",
              },
              {
                label: t("app.reports.summary.operatingProfit"),
                value: money(data.operatingProfit),
                icon: <ReceiptText className="size-4" />,
                tone: data.operatingProfit >= 0 ? "primary" : "danger",
              },
              {
                label: t("app.reports.summary.profitBeforeTax"),
                value: money(data.profitBeforeTax ?? data.netProfit),
                icon: <ReceiptText className="size-4" />,
                tone: (data.profitBeforeTax ?? data.netProfit) >= 0 ? "primary" : "danger",
              },
              {
                label: t("app.reports.summary.netProfit"),
                value: money(data.netProfit),
                icon: <ChartNoAxesCombined className="size-4" />,
                tone: data.netProfit >= 0 ? "success" : "danger",
              },
            ]}
          />

          <div className="grid items-start gap-4 xl:grid-cols-2">
            {data.sections
              .filter(
                (section) =>
                  section.rows.length > 0 ||
                  ["REVENUE", "COST_OF_SALES", "OPERATING_EXPENSE"].includes(section.code),
              )
              .map((section) => (
              <AccountingReportSectionCard
                key={section.code}
                title={sectionTitles[section.code] ?? section.name}
                total={money(section.total ?? 0)}
                columns={columns}
                dataSource={section.rows}
                emptyText={t("app.reports.income.empty")}
                tone={sectionTone(section.code)}
                rowKey={(row) =>
                  row.accountId ?? row.accountNumber ?? row.accountName
                }
              />
            ))}
          </div>
        </>
      )}
    </AccountingReportPageShell>
  );
}
