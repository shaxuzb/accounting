import { useFormik } from "formik";
import { useState } from "react";
import LedgerBalanceEquation from "../components/LedgerBalanceEquation";
import LedgerFilters from "../components/LedgerFilters";
import LedgerTable from "../components/LedgerTable";
import { useGetLedger } from "../hooks";
import type { LedgerQuery } from "../types/type";

const initialValues: LedgerQuery = {
  accountId: null,
  dateFrom: "",
  dateTo: "",
  page: 1,
  pageSize: 50,
};

export default function LedgerPage() {
  const [filters, setFilters] = useState<LedgerQuery>();
  const query = useGetLedger(filters);
  const formik = useFormik<LedgerQuery>({
    initialValues,
    onSubmit: (values) => setFilters(values.accountId ? values : undefined),
  });
  const data = query.data;

  return (
    <div className="space-y-2">
      <LedgerFilters
        formik={formik}
        loading={query.isFetching}
        onAccountChange={(accountId) =>
          setFilters(
            accountId
              ? {
                  accountId,
                  dateFrom: formik.values.dateFrom,
                  dateTo: formik.values.dateTo,
                  page: 1,
                  pageSize: 50,
                }
              : undefined,
          )
        }
        onDateChange={(dateFrom, dateTo) => {
          const accountId = formik.values.accountId;
          if (accountId) {
            setFilters((current) => ({
              ...current,
              accountId,
              dateFrom,
              dateTo,
              page: 1,
              pageSize: current?.pageSize ?? 50,
            }));
          }
        }}
        onRefresh={() => void query.refetch()}
      />

      {data && (
        <LedgerBalanceEquation
          openingBalance={data.openingBalance}
          totalDebit={data.totalDebit}
          totalCredit={data.totalCredit}
          closingBalance={data.closingBalance}
        />
      )}

      <LedgerTable
        result={data}
        filters={filters}
        loading={query.isLoading || query.isFetching}
        onPageChange={(page, pageSize) =>
          setFilters((current) =>
            current ? { ...current, page, pageSize } : current,
          )
        }
      />
    </div>
  );
}
