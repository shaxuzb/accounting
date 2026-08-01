import { useFormik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportGenericArrayTable from "../components/AccountingReportGenericArrayTable";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import { useGetAccountCard } from "../hooks";
import type { AccountCardQuery } from "../types/type";

const initialValues: AccountCardQuery = {
  accountId: null,
  periodId: null,
  dateFrom: "",
  dateTo: "",
  currencyId: null,
};

export default function AccountCardPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState<AccountCardQuery | null>(null);
  const query = useGetAccountCard(submitted?.accountId ? submitted : undefined);

  const formik = useFormik<AccountCardQuery>({
    initialValues,
    validate: (values) => {
      const errors: Partial<Record<keyof AccountCardQuery, string>> = {};
      if (!values.accountId) {
        errors.accountId = t("openingBalance.validation.accountRequired");
      }
      return errors;
    },
    onSubmit: (values) => setSubmitted(values),
  });

  return (
    <AccountingReportPageShell
      title={t("app.reports.card.title")}
      description={t("app.reports.card.description")}
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
          <SelectCustom
            formik={formik}
            fieldName="accountId"
            label={t("app.reports.fields.account")}
            path={selectListEndpoints.chartAccountsSelectList}
            clearable
            optionLabel={chartAccountOptionLabel}
            selectedLabel={chartAccountSelectedLabel}
          />
          <InputNumber formik={formik} fieldName="periodId" label={t("app.reports.fields.periodId")} min={1} />
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

      <AccountingReportGenericArrayTable
        data={query.data}
        title={t("app.reports.card.table")}
        emptyText={t("app.reports.card.empty")}
      />

    </AccountingReportPageShell>
  );
}
