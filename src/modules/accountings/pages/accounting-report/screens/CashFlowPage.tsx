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
  const [submitted, setSubmitted] = useState<CashFlowQuery | null>(null);
  const query = useGetCashFlow(submitted ?? undefined);

  const formik = useFormik<CashFlowQuery>({
    initialValues,
    onSubmit: (values) => setSubmitted(values),
  });

  const data = query.data;

  const columns = useMemo<ColumnsType<CashFlowRow>>(
    () => [
      { title: "Counterpart account", dataIndex: "counterpartAccountCode", width: 170 },
      { title: "Account name", dataIndex: "counterpartAccountName" },
      { title: "Inflow", dataIndex: "inflow", align: "right", width: 140, render: (value) => numberSpacing(value, undefined, true) },
      { title: "Outflow", dataIndex: "outflow", align: "right", width: 140, render: (value) => numberSpacing(value, undefined, true) },
      { title: "Net", dataIndex: "net", align: "right", width: 140, render: (value) => <span className="font-semibold">{numberSpacing(value, undefined, true)}</span> },
    ],
    [],
  );

  return (
    <AccountingReportPageShell
      title="Cash flow"
      description="Pul oqimi bo'yicha kirim, chiqim va sof farq."
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
              {
                label: "Opening cash balance",
                value: numberSpacing(data.openingCashBalance, undefined, true),
                tone: "primary",
              },
              {
                label: "Closing cash balance",
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
