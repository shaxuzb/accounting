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
  const [submitted, setSubmitted] = useState<JournalQuery | null>(null);
  const query = useGetJournal(submitted ?? undefined);

  const formik = useFormik<JournalQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  return (
    <AccountingReportPageShell
      title="Journal"
      description="Barcha qaydlar va postlar uchun umumiy jurnal."
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
          <InputNumber formik={formik} fieldName="page" label="Page" min={1} />
          <InputNumber formik={formik} fieldName="pageSize" label="Page size" min={1} />
        </div>
      </AccountingReportFiltersCard>

      <AccountingReportGenericArrayTable
        data={query.data}
        title="Journal rows"
        emptyText="Journal rows topilmadi"
      />

      <AccountingReportRawCard
        data={query.data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Journal natijasi yo'q"
      />
    </AccountingReportPageShell>
  );
}
