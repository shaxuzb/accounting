import { useFormik } from "formik";
import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { customDate, numberSpacing } from "@/utils/utils";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportRawCard from "../components/AccountingReportRawCard";
import AccountingReportSectionCard from "../components/AccountingReportSectionCard";
import AccountingReportSummaryGrid from "../components/AccountingReportSummaryGrid";
import { useGetAccountTurnover } from "../hooks";
import type { AccountTurnoverEntry, AccountTurnoverQuery } from "../types/type";

const initialValues: AccountTurnoverQuery = {
  periodId: null,
  dateFrom: "",
  dateTo: "",
  currencyId: null,
  documentTypeId: null,
  page: 1,
  pageSize: 50,
};

export default function AccountTurnoverPage() {
  const [submitted, setSubmitted] = useState<AccountTurnoverQuery | null>(null);
  const query = useGetAccountTurnover(submitted ?? undefined);

  const formik = useFormik<AccountTurnoverQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  const data = query.data;

  const columns = useMemo<ColumnsType<AccountTurnoverEntry>>(
    () => [
      {
        title: "Posting date",
        dataIndex: "postingDate",
        width: 160,
        render: (value) => (value ? customDate(value) : "-"),
      },
      { title: "Journal #", dataIndex: "journalNumber", width: 150 },
      { title: "Document #", dataIndex: "documentNumber", width: 150 },
      { title: "Document type", dataIndex: "documentType", width: 150 },
      { title: "Description", dataIndex: "description", width: 220 },
      { title: "Debit account", dataIndex: "debitAccountCode", width: 180, render: (_, record) => `${record.debitAccountCode} - ${record.debitAccountName}` },
      { title: "Credit account", dataIndex: "creditAccountCode", width: 180, render: (_, record) => `${record.creditAccountCode} - ${record.creditAccountName}` },
      { title: "Amount", dataIndex: "amount", width: 140, align: "right", render: (value) => <span className="font-semibold">{numberSpacing(value, undefined, true)}</span> },
      { title: "Currency", dataIndex: "currency", width: 100 },
      { title: "Organization", dataIndex: "organization", width: 160 },
      { title: "Counterparty", dataIndex: "counterparty", width: 160 },
      { title: "Warehouse", dataIndex: "warehouse", width: 160 },
    ],
    [],
  );

  return (
    <AccountingReportPageShell
      title="Account turnover"
      description="Provodkalar ro'yxati, jurnal raqami, hujjat va miqdorlar bilan."
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
            label="Period ID"
            min={1}
          />
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
          <InputNumber
            formik={formik}
            fieldName="pageSize"
            label="Page size"
            min={1}
          />
        </div>
      </AccountingReportFiltersCard>

      {data && (
        <>
          <AccountingReportSummaryGrid
            items={[
              { label: "Total count", value: data.totalCount, tone: "primary" },
              { label: "Total pages", value: data.totalPages },
              {
                label: "Has previous page",
                value: data.hasPreviousPage ? "Yes" : "No",
              },
              { label: "Has next page", value: data.hasNextPage ? "Yes" : "No" },
            ]}
          />

          <AccountingReportSectionCard
            title="Entries"
            total={data.totalCount}
            columns={columns}
            dataSource={data.entries}
            emptyText="Entries topilmadi"
          />
        </>
      )}

      <AccountingReportRawCard
        data={data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Account turnover natijasi yo'q"
      />
    </AccountingReportPageShell>
  );
}
