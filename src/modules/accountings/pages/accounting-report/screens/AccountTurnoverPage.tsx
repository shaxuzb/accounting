import { useFormik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpenText, Repeat2, Scale } from "lucide-react";
import { useSearchParams } from "react-router";
import AccountTurnoverTable from "../components/AccountTurnoverTable";
import AccountingReportFilterBar from "../components/AccountingReportFilterBar";
import AccountingReportLedgerSummary from "../components/AccountingReportLedgerSummary";
import AccountingReportPageShell from "../components/AccountingReportPageShell";
import { useGetAccountTurnover } from "../hooks";
import type { AccountTurnoverQuery } from "../types/type";

const initialValues: AccountTurnoverQuery = {
  dateFrom: "",
  dateTo: "",
};

export default function AccountTurnoverPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<AccountTurnoverQuery>({});
  const query = useGetAccountTurnover(filters);

  const formik = useFormik<AccountTurnoverQuery>({
    initialValues,
    onSubmit: (values) => setFilters({ ...values }),
  });

  const data = query.data;
  const search = (searchParams.get("search") ?? "").trim().toLocaleLowerCase();

  const filteredItems = !search
    ? (data?.items ?? [])
    : (data?.items ?? []).filter((item) =>
        [item.accountNumber, item.accountCode, item.accountName].some((value) =>
          String(value ?? "")
            .toLocaleLowerCase()
            .includes(search),
        ),
      );

  return (
    <AccountingReportPageShell>
      <AccountingReportFilterBar
        formik={formik}
        loading={query.isFetching}
        onDateChange={(dateFrom, dateTo) => setFilters({ dateFrom, dateTo })}
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

      <AccountTurnoverTable
        items={filteredItems}
        loading={query.isLoading || query.isFetching}
        filters={filters}
      />
    </AccountingReportPageShell>
  );
}
