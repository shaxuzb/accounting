import { useFormik } from "formik";
import { useMemo, useState } from "react";
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
      { title: "Account code", dataIndex: "accountCode", width: 140 },
      { title: "Account name", dataIndex: "accountName" },
      {
        title: "Balance",
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
    [],
  );

  return (
    <AccountingReportPageShell
      title="Balance sheet"
      description="Aktivlar, majburiyatlar va kapital bo'yicha to'liq hisobot."
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
                label: "Total assets",
                value: numberSpacing(data.totalAssets, undefined, true),
                tone: "primary",
              },
              {
                label: "Total liabilities",
                value: numberSpacing(data.totalLiabilities, undefined, true),
                tone: "danger",
              },
              {
                label: "Total equity",
                value: numberSpacing(data.totalEquity, undefined, true),
                tone: "success",
              },
              {
                label: "Liabilities + equity",
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
                <div className="text-xs text-secondary-text">Period ID</div>
                <div className="font-semibold">{data.periodId ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">Date from</div>
                <div className="font-semibold">
                  {data.dateFrom ? customDate(data.dateFrom) : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">Date to</div>
                <div className="font-semibold">
                  {data.dateTo ? customDate(data.dateTo) : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-text">Currency ID</div>
                <div className="font-semibold">{data.currencyId ?? "-"}</div>
              </div>
            </div>
          </Card>
        </>
      )}

    </AccountingReportPageShell>
  );
}
