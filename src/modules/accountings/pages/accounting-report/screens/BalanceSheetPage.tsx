import type { ColumnsType } from "antd/es/table";
import { useFormik } from "formik";
import { Landmark, Layers3, PiggyBank, Scale } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { numberSpacing } from "@/utils/utils";
import AccountingReportFilterBar from "../components/AccountingReportFilterBar";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetBalanceSheet } from "../hooks";
import type { BalanceSheetQuery, BalanceSheetRow } from "../types/type";

const initialValues: BalanceSheetQuery = { dateFrom: "", dateTo: "" };
const money = (value: number) => numberSpacing(value, undefined, true);

export default function BalanceSheetPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BalanceSheetQuery>({});
  const query = useGetBalanceSheet(filters);
  const formik = useFormik<BalanceSheetQuery>({
    initialValues,
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
  const difference = data
    ? data.totalAssets - data.totalLiabilitiesAndEquity
    : 0;
  const isBalanced = Math.abs(difference) < 0.01;

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
