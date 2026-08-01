import { useFormik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
// import InputNumber from "@/components/fields/InputNumber";
// import SelectCustom from "@/components/fields/SelectCustom";
// import SelectDate from "@/components/fields/SelectDate";
// import { selectListEndpoints } from "@/shared/constants/selectLists";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportGenericArrayTable from "../components/AccountingReportGenericArrayTable";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import { useGetJournal } from "../hooks";
import type { JournalQuery } from "../types/type";

const initialValues: JournalQuery = {
  periodId: null,
  dateFrom: "",
  dateTo: "",
  currencyId: null,
  documentTypeId: null,
  page: 1,
  pageSize: 50,
};

export default function JournalPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState<JournalQuery | null>(null);
  const query = useGetJournal(submitted ?? undefined);

  const formik = useFormik<JournalQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  return (
    <AccountingReportPageShell
      title={t("app.reports.journal.title")}
      description={t("app.reports.journal.description")}
    >
      <AccountingReportFiltersCard
        formik={formik}
        loading={query.isFetching}
        onReset={() => {
          formik.resetForm();
          setSubmitted(null);
        }}
        children={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {/* <InputNumber formik={formik} fieldName="periodId" label="Period ID" min={1} />
            <SelectDate formik={formik} fieldName="dateFrom" label="Date from" />
            <SelectDate formik={formik} fieldName="dateTo" label="Date to" />
            <SelectCustom
              formik={formik}
              fieldName="currencyId"
              label="Currency"
              path={selectListEndpoints.currenciesSelectList}
              clearable
            />
            <SelectCustom
              formik={formik}
              fieldName="documentTypeId"
              label="Document type"
              path={selectListEndpoints.documentTypesSelectList}
              clearable
            /> */}
          </div>
        }

      />
      {/* <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <SelectCustom
            formik={formik}
            fieldName="documentTypeId"
            label="Document type"
            path={selectListEndpoints.documentTypesSelectList}
            clearable
          /> 
         
         </div> */}

      <AccountingReportGenericArrayTable
        data={query.data}
        title={t("app.reports.journal.table")}
        emptyText={t("app.reports.journal.empty")}
      />
    </AccountingReportPageShell>
  );
}
