import { Alert, Button, DatePicker, Select, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import * as XLSX from "xlsx";
import { numberSpacing } from "@/utils/utils";
import type { TaxForm, TaxFormHeader, TaxFormLine, TaxFormSheet } from "./api";

export const taxAmount = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  if (value === 0) return "—";
  return numberSpacing(value, undefined, true);
};

const tabs = [
  { key: "vat-return", labelKey: "app.taxReports.vatReturn" },
  { key: "vat-register", labelKey: "app.taxReports.vatRegister" },
  { key: "turnover-tax", labelKey: "app.taxReports.turnoverTax" },
  { key: "profit-tax", labelKey: "app.taxReports.profitTax" },
  { key: "payroll-tax", labelKey: "app.taxReports.payrollTax" },
  { key: "property-tax", labelKey: "app.taxReports.propertyTax" },
];

/** The tax reports section with its tabs. */
export function TaxReportShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const activeKey = tabs.find((tab) => location.pathname.endsWith(`/${tab.key}`))?.key ?? tabs[0].key;
  const basePath = location.pathname.replace(/\/[^/]+\/?$/, "");
  return (
    <div className="space-y-4">
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={(key) => navigate(`${basePath}/${key}`)}
        items={tabs.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
        className="[&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:rounded-xl [&_.ant-tabs-nav]:border-border [&_.ant-tabs-nav]:bg-card [&_.ant-tabs-nav]:p-2 [&_.ant-tabs-nav]:before:border-0! [&_.ant-tabs-tab]:rounded-lg! [&_.ant-tabs-tab]:border-0! [&_.ant-tabs-tab]:bg-transparent! [&_.ant-tabs-tab]:px-3! [&_.ant-tabs-tab]:py-2! [&_.ant-tabs-tab-btn]:text-secondary-text [&_.ant-tabs-tab-active]:bg-brand! [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-on-brand!"
      />
      {children}
    </div>
  );
}

interface PeriodBarProps {
  year: number;
  onYear: (year: number) => void;
  month?: number;
  onMonth?: (month: number) => void;
  quarter?: number;
  onQuarter?: (quarter: number) => void;
  loading?: boolean;
  onRefresh: () => void;
  onExport?: () => void;
}

export function PeriodBar({ year, onYear, month, onMonth, quarter, onQuarter, loading, onRefresh, onExport }: PeriodBarProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
      <DatePicker picker="year" value={dayjs(`${year}-01-01`)} allowClear={false} onChange={(value) => value && onYear(value.year())} />
      {onMonth && (
        <Select
          className="w-40"
          value={month}
          onChange={onMonth}
          options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: dayjs().month(i).format("MMMM") }))}
        />
      )}
      {onQuarter && (
        <Select
          className="w-48"
          value={quarter}
          onChange={onQuarter}
          options={[1, 2, 3, 4].map((q) => ({ value: q, label: q === 4 ? t("app.taxReports.year") : t("app.taxReports.quarter", { quarter: q }) }))}
        />
      )}
      <div className="ml-auto flex gap-2">
        <Button icon={<RefreshCw className="size-4" />} onClick={onRefresh} loading={loading} />
        {onExport && (
          <Button icon={<FileSpreadsheet className="size-4" />} onClick={onExport}>
            Excel
          </Button>
        )}
      </div>
    </div>
  );
}

export function TaxHeader({ header, title, period }: { header?: TaxFormHeader; title: string; period: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-center text-base font-semibold text-text">{title}</div>
      <div className="text-center text-sm text-secondary-text">{period}</div>
      {header && (
        <div className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <span>
            <span className="text-secondary-text">{t("app.regulatedForms.organization")}: </span>
            <b>{header.organizationName}</b>
          </span>
          <span>
            <span className="text-secondary-text">{t("app.regulatedForms.inn")}: </span>
            <b>{header.inn ?? "—"}</b>
          </span>
          {header.regimeName && (
            <span>
              <span className="text-secondary-text">{t("app.taxReports.regime")}: </span>
              {header.regimeName}
              {header.rate != null && ` (${header.rate}%)`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** A sheet of a tax form: code, name and its own value columns. */
export function TaxSheet({ sheet }: { sheet: TaxFormSheet }) {
  const { t } = useTranslation();
  const valueKeys = ["value1", "value2", "value3", "value4", "value5", "value6"] as const;
  const columns: ColumnsType<TaxFormLine> = [
    {
      title: t("app.regulatedForms.indicator"),
      dataIndex: "name",
      render: (value: string, row) => (
        <span className={row.isTotal ? "font-semibold" : ""} style={{ paddingLeft: row.level > 1 ? 20 : 0 }}>
          {value}
        </span>
      ),
    },
    { title: t("app.regulatedForms.lineCode"), dataIndex: "code", width: 90, align: "center" },
    ...sheet.columns.map((title, index) => ({
      title,
      width: 170,
      align: "right" as const,
      render: (_: unknown, row: TaxFormLine) => {
        const value = row[valueKeys[index]] ?? null;
        return value === null ? <span className="text-secondary-text">x</span> : <span className={`tabular-nums ${row.isTotal ? "font-semibold" : ""}`}>{taxAmount(value)}</span>;
      },
    })),
  ];
  return (
    <div className="space-y-2">
      <div className="font-medium text-text">{sheet.title}</div>
      <Table<TaxFormLine>
        size="small"
        bordered
        pagination={false}
        rowKey="code"
        columns={columns}
        dataSource={sheet.lines}
        rowClassName={(row) => (row.isTotal ? "bg-primary-bg" : "")}
        scroll={{ x: "max-content" }}
      />
      {sheet.note && <div className="text-xs text-secondary-text">{sheet.note}</div>}
    </div>
  );
}

/** The warnings and the reconciliation with the ledger a form carries. */
export function TaxChecks({ form }: { form: TaxForm }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {form.warnings.map((warning) => (
        <Alert key={warning} type="warning" showIcon message={warning} />
      ))}
      {form.reconciliation.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 font-medium text-text">{t("app.taxReports.reconciliation")}</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-secondary-text">
                <th className="text-left font-normal" />
                <th className="text-right font-normal">{t("app.taxReports.form")}</th>
                <th className="text-right font-normal">{t("app.taxReports.ledger")}</th>
                <th className="text-right font-normal">{t("app.taxReports.difference")}</th>
              </tr>
            </thead>
            <tbody>
              {form.reconciliation.map((row) => (
                <tr key={row.title} className="border-t border-border">
                  <td className="py-1">
                    {row.title}
                    {row.note && Math.abs(row.difference) >= 0.01 && <div className="text-xs text-secondary-text">{row.note}</div>}
                  </td>
                  <td className="text-right tabular-nums">{taxAmount(row.form)}</td>
                  <td className="text-right tabular-nums">{taxAmount(row.ledger)}</td>
                  <td className={`text-right tabular-nums ${Math.abs(row.difference) >= 0.01 ? "font-semibold text-amber-600" : "text-green-600"}`}>
                    {Math.abs(row.difference) >= 0.01 ? taxAmount(row.difference) : "✓"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** All the sheets of a form into one Excel book, a sheet per annex. */
export const exportTaxForm = (fileName: string, title: string, form: TaxForm) => {
  const book = XLSX.utils.book_new();
  form.sheets.forEach((sheet) => {
    const rows = [
      [title],
      [form.periodName],
      [`${form.header.organizationName} — ${form.header.inn ?? ""}`],
      [sheet.title],
      [],
      ["", "", ...sheet.columns],
      ...sheet.lines.map((line) => [
        line.name,
        line.code,
        ...sheet.columns.map((_, i) => {
          const value = [line.value1, line.value2, line.value3, line.value4, line.value5 ?? null, line.value6 ?? null][i];
          return value === null ? "x" : value;
        }),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 80 }, { wch: 8 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(book, ws, sheet.code === "MAIN" ? "Hisob-kitob" : sheet.code);
  });
  XLSX.writeFile(book, fileName);
};
