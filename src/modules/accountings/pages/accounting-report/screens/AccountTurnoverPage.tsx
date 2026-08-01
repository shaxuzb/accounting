import { useFormik } from "formik";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ColumnsType } from "antd/es/table";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { customDate, numberSpacing } from "@/utils/utils";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
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
  const { t } = useTranslation();
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
        title: t("app.reports.fields.postingDate"),
        dataIndex: "postingDate",
        width: 160,
        render: (value) => (value ? customDate(value) : "-"),
      },
      { title: t("app.reports.fields.journalNumber"), dataIndex: "journalNumber", width: 150 },
      { title: t("app.reports.fields.documentNumber"), dataIndex: "documentNumber", width: 150 },
      { title: t("app.reports.fields.documentType"), dataIndex: "documentType", width: 150 },
      { title: t("app.reports.fields.description"), dataIndex: "description", width: 220 },
      { title: t("app.reports.fields.debitAccount"), dataIndex: "debitAccountCode", width: 180, render: (_, record) => `${record.debitAccountCode} - ${record.debitAccountName}` },
      { title: t("app.reports.fields.creditAccount"), dataIndex: "creditAccountCode", width: 180, render: (_, record) => `${record.creditAccountCode} - ${record.creditAccountName}` },
      { title: t("app.reports.fields.amount"), dataIndex: "amount", width: 140, align: "right", render: (value) => <span className="font-semibold">{numberSpacing(value, undefined, true)}</span> },
      { title: t("app.reports.fields.currency"), dataIndex: "currency", width: 100 },
      { title: t("app.reports.fields.organization"), dataIndex: "organization", width: 160 },
      { title: t("app.reports.fields.counterparty"), dataIndex: "counterparty", width: 160 },
      { title: t("app.reports.fields.warehouse"), dataIndex: "warehouse", width: 160 },
    ],
    [t],
  );

  return (
    <AccountingReportPageShell
      title={t("app.reports.turnover.title")}
      description={t("app.reports.turnover.description")}
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
          <SelectCustom
            formik={formik}
            fieldName="documentTypeId"
            label={t("app.reports.fields.documentType")}
            path={selectListEndpoints.documentTypesSelectList}
            clearable
          />
          <InputNumber formik={formik} fieldName="page" label={t("app.reports.fields.page")} min={1} />
          <InputNumber
            formik={formik}
            fieldName="pageSize"
            label={t("app.reports.fields.pageSize")}
            min={1}
          />
        </div>
      </AccountingReportFiltersCard>

      {data && (
        <>
          <AccountingReportSummaryGrid
            items={[
              { label: t("app.reports.summary.totalCount"), value: data.totalCount, tone: "primary" },
              { label: t("app.reports.summary.totalPages"), value: data.totalPages },
              {
                label: t("app.reports.summary.hasPreviousPage"),
                value: data.hasPreviousPage ? t("app.common.yes") : t("app.common.no"),
              },
              { label: t("app.reports.summary.hasNextPage"), value: data.hasNextPage ? t("app.common.yes") : t("app.common.no") },
            ]}
          />

          <AccountingReportSectionCard
            title={t("app.reports.turnover.table")}
            total={data.totalCount}
            columns={columns}
            dataSource={data.entries}
            emptyText={t("app.reports.turnover.empty")}
          />
        </>
      )}

    </AccountingReportPageShell>
  );
}
