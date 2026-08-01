import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetIncomeStatement } from "../hooks";
import type {
  IncomeStatementQuery,
  IncomeStatementRow,
} from "../types/type";

const initialValues: IncomeStatementQuery = {
  periodId: null,
  dateFrom: "",
  dateTo: "",
  currencyId: null,
};

export default function IncomeStatementPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState<IncomeStatementQuery | null>(null);
  const query = useGetIncomeStatement(submitted ?? undefined);

  const formik = useFormik<IncomeStatementQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  const data = query.data;

  const columns = useMemo<ColumnsType<IncomeStatementRow>>(
    () => [
      { title: t("app.reports.fields.accountCode"), dataIndex: "accountCode", width: 140 },
      { title: t("app.reports.fields.accountName"), dataIndex: "accountName" },
      {
        title: t("app.reports.fields.amount"),
        dataIndex: "amount",
        align: "right",
        width: 160,
        render: (value) => (
          <span className="font-semibold">
            {numberSpacing(value, undefined, true)}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <AccountingReportPageShell
      title={t("app.reports.income.title")}
      description={t("app.reports.income.description")}
    >
      <AccountingReportFiltersCard
        formik={formik}
        loading={query.isFetching}
        onReset={() => {
          formik.resetForm();
          setSubmitted(null);
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputNumber
            formik={formik}
            fieldName="periodId"
            label={t("app.reports.fields.periodId")}
            min={1}
          />
          <SelectDate formik={formik} fieldName="dateFrom" label={t("app.reports.fields.dateFrom")} />
          <SelectDate formik={formik} fieldName="dateTo" label={t("app.reports.fields.dateTo")} />
          <SelectCustom
            formik={formik}
            fieldName="currencyId"
            label={t("app.reports.fields.currency")}
            path={selectListEndpoints.currenciesSelectList}
            clearable
          />
        </div>
      </AccountingReportFiltersCard>

      {data && (
        <>
          <AccountingReportSummaryGrid
            items={[
              { label: t("app.reports.summary.revenue"), value: numberSpacing(data.revenueTotal, undefined, true), tone: "primary" },
              { label: t("app.reports.summary.costOfSales"), value: numberSpacing(data.costOfSalesTotal, undefined, true), tone: "danger" },
              { label: t("app.reports.summary.operatingExpense"), value: numberSpacing(data.operatingExpenseTotal, undefined, true), tone: "danger" },
              { label: t("app.reports.summary.netProfit"), value: numberSpacing(data.netProfit, undefined, true), tone: "success" },
            ]}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {data.sections.map((section) => (
              <AccountingReportSectionCard
                key={section.code}
                title={section.name}
                total={section.total}
                columns={columns}
                dataSource={section.rows}
              />
            ))}
          </div>
        </>
      )}

    </AccountingReportPageShell>
  );
}
