import { Spin } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import { usePayrollTaxReturn, useProfitTax, useTurnoverTax, useVatReturn, type TaxForm } from "./api";
import { exportTaxForm, PeriodBar, TaxChecks, TaxHeader, TaxReportShell, TaxSheet } from "./shared";

function FormBody({ form, title }: { form?: TaxForm; title: string }) {
  if (!form) return null;
  return (
    <div className="space-y-4">
      <TaxChecks form={form} />
      <TaxHeader header={form.header} title={title} period={form.periodName} />
      {form.sheets.map((sheet) => (
        <TaxSheet key={sheet.code} sheet={sheet} />
      ))}
    </div>
  );
}

const useMonthState = (name: string) => {
  const key = useScopedStorageKey("report-state", name);
  const now = dayjs();
  // the return of the month just ended is the one being prepared
  const last = now.subtract(1, "month");
  return usePersistedState<{ year: number; month: number }>(key, { year: last.year(), month: last.month() + 1 }, { debounceMs: 0 });
};

/** The VAT return (resolution No. 3221, annex 1). */
export function VatReturnPage() {
  const { t } = useTranslation();
  const [state, setState] = useMonthState("tax-vat-return");
  const query = useVatReturn(state);
  const title = t("app.taxReports.vatReturnTitle");
  return (
    <TaxReportShell>
      <PeriodBar
        year={state.year}
        onYear={(year) => setState({ ...state, year })}
        month={state.month}
        onMonth={(month) => setState({ ...state, month })}
        loading={query.isFetching}
        onRefresh={() => void query.refetch()}
        onExport={query.data ? () => exportTaxForm(`QQS-${state.year}-${String(state.month).padStart(2, "0")}.xlsx`, title, query.data!) : undefined}
      />
      <Spin spinning={query.isFetching}>
        <FormBody form={query.data} title={title} />
      </Spin>
    </TaxReportShell>
  );
}

/** The personal income tax and social tax return (annex 4), from the month's payroll. */
export function PayrollTaxReturnPage() {
  const { t } = useTranslation();
  const [state, setState] = useMonthState("tax-payroll");
  const query = usePayrollTaxReturn(state);
  const title = t("app.taxReports.payrollTaxTitle");
  return (
    <TaxReportShell>
      <PeriodBar
        year={state.year}
        onYear={(year) => setState({ ...state, year })}
        month={state.month}
        onMonth={(month) => setState({ ...state, month })}
        loading={query.isFetching}
        onRefresh={() => void query.refetch()}
        onExport={query.data ? () => exportTaxForm(`JShDS-ijtimoiy-${state.year}-${String(state.month).padStart(2, "0")}.xlsx`, title, query.data!) : undefined}
      />
      <Spin spinning={query.isFetching}>
        <FormBody form={query.data} title={title} />
      </Spin>
    </TaxReportShell>
  );
}

/** The turnover tax return (annex 9), from the start of the year. */
export function TurnoverTaxPage() {
  const { t } = useTranslation();
  const [state, setState] = useMonthState("tax-turnover");
  const query = useTurnoverTax(state);
  const title = t("app.taxReports.turnoverTaxTitle");
  return (
    <TaxReportShell>
      <PeriodBar
        year={state.year}
        onYear={(year) => setState({ ...state, year })}
        month={state.month}
        onMonth={(month) => setState({ ...state, month })}
        loading={query.isFetching}
        onRefresh={() => void query.refetch()}
        onExport={query.data ? () => exportTaxForm(`aylanma-soliq-${state.year}-${String(state.month).padStart(2, "0")}.xlsx`, title, query.data!) : undefined}
      />
      <Spin spinning={query.isFetching}>
        <FormBody form={query.data} title={title} />
      </Spin>
    </TaxReportShell>
  );
}

/** The profit tax return (annex 3), quarterly and cumulative. */
export function ProfitTaxPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "tax-profit");
  const now = dayjs();
  const [state, setState] = usePersistedState<{ year: number; quarter: number }>(
    key,
    { year: now.year(), quarter: Math.max(1, Math.floor(now.month() / 3)) },
    { debounceMs: 0 },
  );
  const query = useProfitTax(state);
  const title = t("app.taxReports.profitTaxTitle");
  return (
    <TaxReportShell>
      <PeriodBar
        year={state.year}
        onYear={(year) => setState({ ...state, year })}
        quarter={state.quarter}
        onQuarter={(quarter) => setState({ ...state, quarter })}
        loading={query.isFetching}
        onRefresh={() => void query.refetch()}
        onExport={query.data ? () => exportTaxForm(`foyda-solig-${state.year}-Q${state.quarter}.xlsx`, title, query.data!) : undefined}
      />
      <Spin spinning={query.isFetching}>
        <FormBody form={query.data} title={title} />
      </Spin>
    </TaxReportShell>
  );
}
