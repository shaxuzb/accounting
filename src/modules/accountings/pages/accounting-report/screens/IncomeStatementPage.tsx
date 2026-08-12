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
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetIncomeStatement } from "../hooks";
import type { IncomeStatementQuery, IncomeStatementRow } from "../types/type";

const initialValues: IncomeStatementQuery = { dateFrom: "", dateTo: "" };
const money = (value: number) => numberSpacing(value, undefined, true);

const sectionTone = (code: string) => {
  if (code === "REVENUE" || code === "OTHER_INCOME") return "success" as const;
  if (code === "COST_OF_SALES" || code === "OTHER_EXPENSE") return "danger" as const;
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
  };

  return (
    <AccountingReportPageShell>
      <AccountingReportFilterBar
        formik={formik}
        loading={query.isFetching}
        onDateChange={(dateFrom, dateTo) => setFilters({ dateFrom, dateTo })}
        onRefresh={() => void query.refetch()}
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
                label: t("app.reports.summary.netProfit"),
                value: money(data.netProfit),
                icon: <ChartNoAxesCombined className="size-4" />,
                tone: data.netProfit >= 0 ? "success" : "danger",
              },
            ]}
          />

          <div className="grid items-start gap-4 xl:grid-cols-2">
            {data.sections.map((section) => (
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
