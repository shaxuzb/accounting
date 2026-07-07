import { useFormik } from "formik";
import { useState } from "react";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportGenericArrayTable from "../components/AccountingReportGenericArrayTable";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportRawCard from "../components/AccountingReportRawCard";
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
  const [submitted, setSubmitted] = useState<AccountCardQuery | null>(null);
  const query = useGetAccountCard(submitted?.accountId ? submitted : undefined);

  const formik = useFormik<AccountCardQuery>({
    initialValues,
    validate: (values) => {
      const errors: Partial<Record<keyof AccountCardQuery, string>> = {};
      if (!values.accountId) {
        errors.accountId = "Schyotni tanlang";
      }
      return errors;
    },
    onSubmit: (values) => setSubmitted(values),
  });

  return (
    <AccountingReportPageShell
      title="Account card"
      description="Bitta schyot bo'yicha karta va harakatlar."
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
            label="Account"
            path={selectListEndpoints.chartAccountsSelectList}
            clearable
          />
          <InputNumber formik={formik} fieldName="periodId" label="Period ID" min={1} />
          <SelectDate formik={formik} fieldName="dateFrom" label="Date from" />
          <SelectDate formik={formik} fieldName="dateTo" label="Date to" />
          <SelectCustom
            formik={formik}
            fieldName="currencyId"
            label="Currency"
            path={selectListEndpoints.currenciesSelectList}
            clearable
          />
        </div>
      </AccountingReportFiltersCard>

      <AccountingReportGenericArrayTable
        data={query.data}
        title="Account card rows"
        emptyText="Account card rows topilmadi"
      />

      <AccountingReportRawCard
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Account card natijasi yo'q"
      />
    </AccountingReportPageShell>
  );
}
