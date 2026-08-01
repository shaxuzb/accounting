import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import Card from "@/components/ui/card/Card";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { customDate, numberSpacing } from "@/utils/utils";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetBalanceSheet } from "../hooks";
import type {
  BalanceSheetQuery,
  BalanceSheetRow,
} from "../types/type";

const initialValues: BalanceSheetQuery = {
  periodId: null,
  dateFrom: "",
  dateTo: "",
  currencyId: null,
};

export default function BalanceSheetPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState<BalanceSheetQuery | null>(null);
  const query = useGetBalanceSheet(submitted ?? undefined);

  const formik = useFormik<BalanceSheetQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  const data = query.data;
  const sections = data?.sections ?? [];

  const columns = useMemo<ColumnsType<BalanceSheetRow>>(
    () => [
      { title: t("app.reports.fields.accountCode"), dataIndex: "accountCode", width: 140 },
      { title: t("app.reports.fields.accountName"), dataIndex: "accountName" },
      {
        title: t("app.reports.fields.balance"),
        dataIndex: "balance",
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
      title={t("app.reports.balance.title")}
      description={t("app.reports.balance.description")}
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
                label: t("app.reports.summary.totalAssets"),
                value: numberSpacing(data.totalAssets, undefined, true),
                tone: "primary",
              },
              {
                label: t("app.reports.summary.totalLiabilities"),
                value: numberSpacing(data.totalLiabilities, undefined, true),
                tone: "danger",
              },
              {
                label: t("app.reports.summary.totalEquity"),
                value: numberSpacing(data.totalEquity, undefined, true),
                tone: "success",
              },
              {
                label: t("app.reports.summary.liabilitiesAndEquity"),
                value: numberSpacing(data.totalLiabilitiesAndEquity, undefined, true),
                tone: "default",
              },
            ]}
          />

          <div className="grid gap-4">
            {sections.map((section) => (
              <AccountingReportSectionCard
                key={section.code}
                title={section.name}
                total={section.total}
                columns={columns}
                dataSource={section.rows}
              />
            ))}
          </div>

          <Card className="border border-border p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="text-xs text-secondary-text">{t("app.reports.fields.periodId")}</div>
                <div className="font-semibold">{data.periodId ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">{t("app.reports.fields.dateFrom")}</div>
                <div className="font-semibold">
                  {data.dateFrom ? customDate(data.dateFrom) : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">{t("app.reports.fields.dateTo")}</div>
                <div className="font-semibold">
                  {data.dateTo ? customDate(data.dateTo) : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">{t("app.reports.fields.currencyId")}</div>
                <div className="font-semibold">{data.currencyId ?? "-"}</div>
              </div>
            </div>
          </Card>
        </>
      )}

    </AccountingReportPageShell>
  );
}
