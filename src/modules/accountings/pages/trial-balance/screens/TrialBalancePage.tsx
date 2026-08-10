import { useFormik } from "formik";
import { BookOpenText, Repeat2, Scale } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AccountingReportLedgerSummary from "@/modules/accountings/pages/accounting-report/components/AccountingReportLedgerSummary";
import TrialBalanceFilters from "../components/TrialBalanceFilters";
import TrialBalanceTable from "../components/TrialBalanceTable";
import { useGetTrialBalance } from "../hooks";
import type { TrialBalanceQuery } from "../types/type";

const initialValues: TrialBalanceQuery = {
  dateFrom: "",
  dateTo: "",
  includeZeroBalance: false,
};

export default function TrialBalancePage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TrialBalanceQuery>({
    includeZeroBalance: false,
  });
  const query = useGetTrialBalance(filters);
  const formik = useFormik<TrialBalanceQuery>({
    initialValues,
    onSubmit: (values) => setFilters(values),
  });
  const data = query.data;

  return (
    <div className="space-y-4">
      <TrialBalanceFilters
        formik={formik}
        loading={query.isFetching}
        onDateChange={(dateFrom, dateTo) =>
          setFilters((current) => ({ ...current, dateFrom, dateTo }))
        }
        onIncludeZeroBalanceChange={(includeZeroBalance) =>
          setFilters((current) => ({ ...current, includeZeroBalance }))
        }
        onRefresh={() => void query.refetch()}
      />

      {data && (
        <AccountingReportLedgerSummary
          debitLabel={t("openingBalance.fields.debit")}
          creditLabel={t("openingBalance.fields.credit")}
          stages={[
            {
              key: "opening",
              title: t("app.reports.turnover.openingBalance"),
              icon: <BookOpenText className="size-4" />,
              debit: data.openingDebitTotal,
              credit: data.openingCreditTotal,
              tone: "opening",
            },
            {
              key: "period",
              title: t("app.reports.turnover.periodTurnover"),
              icon: <Repeat2 className="size-4" />,
              debit: data.periodDebitTotal,
              credit: data.periodCreditTotal,
              tone: "period",
            },
            {
              key: "closing",
              title: t("app.reports.turnover.closingBalance"),
              icon: <Scale className="size-4" />,
              debit: data.closingDebitTotal,
              credit: data.closingCreditTotal,
              tone: "closing",
            },
          ]}
        />
      )}

      <TrialBalanceTable
        result={data}
        filters={filters}
        loading={query.isLoading || query.isFetching}
      />
    </div>
  );
}
