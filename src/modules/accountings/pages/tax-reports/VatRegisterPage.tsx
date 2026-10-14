import { Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import { useVatRegister, type VatRegister, type VatRegisterRow, type VatRegisterTotal } from "./api";
import { PeriodBar, taxAmount, TaxHeader, TaxReportShell } from "./shared";

const exportRegister = (data: VatRegister, fileName: string, t: (key: string) => string) => {
  const book = XLSX.utils.book_new();
  const head = [t("app.taxReports.colNo"), t("app.taxReports.colCounterparty"), t("app.taxReports.colInn"), t("app.taxReports.colInvoice"), t("app.taxReports.colInvoiceDate"), t("app.taxReports.colNet"), t("app.taxReports.colVat")];
  const purchases = XLSX.utils.aoa_to_sheet([
    [t("app.taxReports.purchaseRegister")],
    [`${data.header.organizationName} — ${data.header.inn ?? ""}`],
    [],
    [...head, t("app.taxReports.colNonCreditableNet"), t("app.taxReports.colNonCreditableVat")],
    [t("app.taxReports.beforePeriod"), "", "", "", "", data.purchasesBeforePeriod.net, data.purchasesBeforePeriod.vat, data.purchasesBeforePeriod.nonCreditableNet, data.purchasesBeforePeriod.nonCreditableVat],
    ...data.purchases.map((x) => [x.no, x.counterpartyName ?? "", x.counterpartyInn ?? "", x.invoiceNumber, dayjs(x.invoiceDate).format("DD.MM.YYYY"), x.net, x.vat, x.nonCreditableNet, x.nonCreditableVat]),
    [t("app.taxReports.periodTotal"), "", "", "", "", data.purchasesPeriod.net, data.purchasesPeriod.vat, data.purchasesPeriod.nonCreditableNet, data.purchasesPeriod.nonCreditableVat],
    [t("app.taxReports.yearTotal"), "", "", "", "", data.purchasesYear.net, data.purchasesYear.vat, data.purchasesYear.nonCreditableNet, data.purchasesYear.nonCreditableVat],
  ]);
  const sales = XLSX.utils.aoa_to_sheet([
    [t("app.taxReports.salesRegister")],
    [`${data.header.organizationName} — ${data.header.inn ?? ""}`],
    [],
    [...head, t("app.taxReports.colTotal")],
    ...data.sales.map((x) => [x.no, x.counterpartyName ?? "", x.counterpartyInn ?? "", x.invoiceNumber, dayjs(x.invoiceDate).format("DD.MM.YYYY"), x.net, x.vat, x.total]),
    [t("app.taxReports.periodTotal"), "", "", "", "", data.salesPeriod.net, data.salesPeriod.vat, data.salesPeriod.net + data.salesPeriod.vat],
  ]);
  XLSX.utils.book_append_sheet(book, purchases, "1-jadval (xaridlar)");
  XLSX.utils.book_append_sheet(book, sales, "2-jadval (sotuvlar)");
  XLSX.writeFile(book, fileName);
};

/** The registers of invoices (VAT return, annex 4): table 1 purchases, table 2 sales. */
export default function VatRegisterPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "tax-vat-register");
  const last = dayjs().subtract(1, "month");
  const [state, setState] = usePersistedState<{ year: number; month: number }>(key, { year: last.year(), month: last.month() + 1 }, { debounceMs: 0 });
  const query = useVatRegister(state);
  const data = query.data;

  const columns = (purchase: boolean): ColumnsType<VatRegisterRow> => [
    { title: t("app.taxReports.colNo"), dataIndex: "no", width: 60, align: "center" },
    {
      title: purchase ? t("app.taxReports.colSupplier") : t("app.taxReports.colBuyer"),
      dataIndex: "counterpartyName",
      render: (value: string | null, row) => (
        <span>
          {value || "—"}
          {row.net < 0 && <Tag className="ml-2" color="orange">{t("app.taxReports.return")}</Tag>}
        </span>
      ),
    },
    { title: t("app.taxReports.colInn"), dataIndex: "counterpartyInn", width: 120 },
    {
      title: t("app.taxReports.colInvoice"),
      dataIndex: "invoiceNumber",
      width: 160,
      render: (value: string, row) => (
        <span>
          {value}
          {!row.hasEsf && row.kind !== "RETAIL" && row.kind !== "CUSTOMS" && <span className="ml-1 text-xs text-secondary-text">({t("app.taxReports.noEsf")})</span>}
        </span>
      ),
    },
    { title: t("app.taxReports.colInvoiceDate"), dataIndex: "invoiceDate", width: 110, render: (value: string) => dayjs(value).format("DD.MM.YYYY") },
    { title: t("app.taxReports.colNet"), dataIndex: "net", width: 150, align: "right", render: (v: number) => <span className="tabular-nums">{taxAmount(v)}</span> },
    { title: t("app.taxReports.colVat"), dataIndex: "vat", width: 130, align: "right", render: (v: number) => <span className="tabular-nums">{taxAmount(v)}</span> },
    ...(purchase
      ? [
          { title: t("app.taxReports.colNonCreditableNet"), dataIndex: "nonCreditableNet", width: 140, align: "right" as const, render: (v: number) => <span className="tabular-nums">{taxAmount(v)}</span> },
          { title: t("app.taxReports.colNonCreditableVat"), dataIndex: "nonCreditableVat", width: 130, align: "right" as const, render: (v: number) => <span className="tabular-nums">{taxAmount(v)}</span> },
        ]
      : [{ title: t("app.taxReports.colTotal"), dataIndex: "total", width: 150, align: "right" as const, render: (v: number) => <span className="tabular-nums">{taxAmount(v)}</span> }]),
  ];

  const totalRow = (label: string, total: VatRegisterTotal, purchase: boolean) => (
    <Table.Summary.Row className="font-semibold">
      <Table.Summary.Cell index={0} colSpan={5}>{label}</Table.Summary.Cell>
      <Table.Summary.Cell index={5} align="right">{taxAmount(total.net)}</Table.Summary.Cell>
      <Table.Summary.Cell index={6} align="right">{taxAmount(total.vat)}</Table.Summary.Cell>
      {purchase ? (
        <>
          <Table.Summary.Cell index={7} align="right">{taxAmount(total.nonCreditableNet)}</Table.Summary.Cell>
          <Table.Summary.Cell index={8} align="right">{taxAmount(total.nonCreditableVat)}</Table.Summary.Cell>
        </>
      ) : (
        <Table.Summary.Cell index={7} align="right">{taxAmount(total.net + total.vat)}</Table.Summary.Cell>
      )}
    </Table.Summary.Row>
  );

  const period = data ? `${dayjs(data.dateFrom).format("DD.MM.YYYY")} — ${dayjs(data.dateTo).format("DD.MM.YYYY")}` : "";

  return (
    <TaxReportShell>
      <PeriodBar
        year={state.year}
        onYear={(year) => setState({ ...state, year })}
        month={state.month}
        onMonth={(month) => setState({ ...state, month })}
        loading={query.isFetching}
        onRefresh={() => void query.refetch()}
        onExport={data ? () => exportRegister(data, `QQS-reestr-${state.year}-${String(state.month).padStart(2, "0")}.xlsx`, t) : undefined}
      />
      <Spin spinning={query.isFetching}>
        {data && (
          <div className="space-y-4">
            <TaxHeader header={data.header} title={t("app.taxReports.vatRegisterTitle")} period={period} />
            <div className="font-medium text-text">{t("app.taxReports.purchaseRegister")}</div>
            <Table<VatRegisterRow>
              size="small"
              bordered
              pagination={false}
              rowKey={(row) => `${row.kind}-${row.documentId}`}
              columns={columns(true)}
              dataSource={data.purchases}
              scroll={{ x: "max-content" }}
              summary={() => (
                <Table.Summary>
                  {totalRow(t("app.taxReports.beforePeriod"), data.purchasesBeforePeriod, true)}
                  {totalRow(t("app.taxReports.periodTotal"), data.purchasesPeriod, true)}
                  {totalRow(t("app.taxReports.yearTotal"), data.purchasesYear, true)}
                </Table.Summary>
              )}
            />
            <div className="font-medium text-text">{t("app.taxReports.salesRegister")}</div>
            <Table<VatRegisterRow>
              size="small"
              bordered
              pagination={false}
              rowKey={(row) => `${row.kind}-${row.documentId}-${row.counterpartyName}`}
              columns={columns(false)}
              dataSource={data.sales}
              scroll={{ x: "max-content" }}
              summary={() => <Table.Summary>{totalRow(t("app.taxReports.periodTotal"), data.salesPeriod, false)}</Table.Summary>}
            />
          </div>
        )}
      </Spin>
    </TaxReportShell>
  );
}
