import { useFormik } from "formik";
import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import InputNumber from "@/components/fields/InputNumber";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { numberSpacing } from "@/utils/utils";
import AccountingReportFiltersCard from "../components/AccountingReportFiltersCard";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import AccountingReportRawCard from "../components/AccountingReportRawCard";
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
  const [submitted, setSubmitted] = useState<IncomeStatementQuery | null>(null);
  const query = useGetIncomeStatement(submitted ?? undefined);

  const formik = useFormik<IncomeStatementQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  const data = query.data;

  const columns = useMemo<ColumnsType<IncomeStatementRow>>(
    () => [
      { title: "Account code", dataIndex: "accountCode", width: 140 },
      { title: "Account name", dataIndex: "accountName" },
      {
        title: "Amount",
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
    [],
  );

  return (
    <AccountingReportPageShell
      title="Income statement"
      description="Daromad, tannarx va foyda / zarar bo'yicha tahlil."
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
        </div>
      </AccountingReportFiltersCard>

      {data && (
        <>
          <AccountingReportSummaryGrid
            items={[
              { label: "Revenue", value: numberSpacing(data.revenueTotal, undefined, true), tone: "primary" },
              { label: "Cost of sales", value: numberSpacing(data.costOfSalesTotal, undefined, true), tone: "danger" },
              { label: "Operating expense", value: numberSpacing(data.operatingExpenseTotal, undefined, true), tone: "danger" },
              { label: "Net profit", value: numberSpacing(data.netProfit, undefined, true), tone: "success" },
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

      <AccountingReportRawCard
        data={data}
        isLoading={query.isLoading || query.isFetching}
        emptyText="Income statement natijasi yo'q"
      />
    </AccountingReportPageShell>
  );
}
