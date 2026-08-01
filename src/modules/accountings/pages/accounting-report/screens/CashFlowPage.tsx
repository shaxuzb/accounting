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
import { useGetCashFlow } from "../hooks";
import type { CashFlowQuery, CashFlowRow } from "../types/type";

const initialValues: CashFlowQuery = {
  periodId: null,
  dateFrom: "",
  dateTo: "",
  currencyId: null,
};

export default function CashFlowPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState<CashFlowQuery | null>(null);
  const query = useGetCashFlow(submitted ?? undefined);

  const formik = useFormik<CashFlowQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  const data = query.data;

  const columns = useMemo<ColumnsType<CashFlowRow>>(
    () => [
      { title: t("app.reports.fields.counterpartAccount"), dataIndex: "counterpartAccountCode", width: 170 },
      { title: t("app.reports.fields.accountName"), dataIndex: "counterpartAccountName" },
      { title: t("app.reports.fields.inflow"), dataIndex: "inflow", align: "right", width: 140, render: (value) => numberSpacing(value, undefined, true) },
      { title: t("app.reports.fields.outflow"), dataIndex: "outflow", align: "right", width: 140, render: (value) => numberSpacing(value, undefined, true) },
      { title: t("app.reports.fields.net"), dataIndex: "net", align: "right", width: 140, render: (value) => <span className="font-semibold">{numberSpacing(value, undefined, true)}</span> },
    ],
    [t],
  );

  return (
    <AccountingReportPageShell
      title={t("app.reports.cashFlow.title")}
      description={t("app.reports.cashFlow.description")}
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
              {
                label: t("app.reports.summary.openingCashBalance"),
                value: numberSpacing(data.openingCashBalance, undefined, true),
                tone: "primary",
              },
              {
                label: t("app.reports.summary.closingCashBalance"),
                value: numberSpacing(data.closingCashBalance, undefined, true),
                tone: "success",
              },
            ]}
          />

          <div className="grid gap-4">
            {data.sections.map((section) => (
              <AccountingReportSectionCard
                key={section.code}
                title={section.name}
                total={section.net}
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
