import { Alert, Button, DatePicker, Select, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import dayjs from "@/config/dayjs";
import { $axiosPrivate } from "@/services/AxiosService";

interface StatFormLine {
  code: string;
  name: string;
  level: number;
  isTotal: boolean;
  values: Array<number | null>;
}

interface StatFormSheet {
  code: string;
  title: string;
  columns: string[];
  lines: StatFormLine[];
  note?: string | null;
}

interface StatForm {
  title: string;
  period: string;
  organizationName: string;
  tin?: string | null;
  sheets: StatFormSheet[];
  warnings: string[];
}

const amount = (value: number | null | undefined) =>
  value == null ? "" : value.toLocaleString("ru-RU", { maximumFractionDigits: 1 });

/**
 * The labour statistics forms of the Statistics Agency (order 10-mb of 15.10.2024): 4-mehnat,
 * quarterly, and 1-mehnat, annual, filled from the payroll; an empty cell is not kept in the
 * system and is filled by hand in e-Stat.
 */
export default function StatisticsFormTab({ kind }: { kind: "quarterly" | "annual" }) {
  const { t } = useTranslation();
  const last = dayjs().subtract(kind === "quarterly" ? 3 : 12, "month");
  const [year, setYear] = useState(last.year());
  const [quarter, setQuarter] = useState(Math.floor(last.month() / 3) + 1);
  const { data, isFetching } = useQuery({
    queryKey: ["payroll-statistics", kind, year, quarter],
    queryFn: () =>
      $axiosPrivate
        .get<StatForm>(`payroll/reports/statistics/${kind}`, { params: kind === "quarterly" ? { year, quarter } : { year } })
        .then((r) => r.data),
  });

  const exportXlsx = () => {
    if (!data) return;
    const book = XLSX.utils.book_new();
    data.sheets.forEach((sheet) => {
      const rows = [
        [data.title],
        [data.period],
        [`${data.organizationName} — ${data.tin ?? ""}`],
        [sheet.title],
        [],
        ["", "", ...sheet.columns],
        ...sheet.lines.map((line) => [line.name, line.code, ...line.values.map((v) => (v == null ? "" : v))]),
      ];
      XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), sheet.code);
    });
    XLSX.writeFile(book, `${kind === "quarterly" ? "4-mehnat" : "1-mehnat"}-${year}${kind === "quarterly" ? `-Q${quarter}` : ""}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <DatePicker picker="year" value={dayjs(`${year}-01-01`)} allowClear={false} onChange={(v) => v && setYear(v.year())} />
        {kind === "quarterly" && (
          <Select
            className="w-36"
            value={quarter}
            onChange={setQuarter}
            options={[1, 2, 3, 4].map((q) => ({ value: q, label: t("payroll.stats.quarter", { quarter: q }) }))}
          />
        )}
        <Button className="ml-auto" icon={<FileSpreadsheet className="size-4" />} disabled={!data} onClick={exportXlsx}>
          Excel
        </Button>
      </div>
      <Spin spinning={isFetching}>
        {data && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-base font-semibold">{data.title}</div>
              <div className="text-sm text-secondary-text">
                {data.period} · {data.organizationName} {data.tin ? `· STIR ${data.tin}` : ""}
              </div>
            </div>
            <Alert type="info" showIcon message={t(kind === "quarterly" ? "payroll.stats.quarterlyHint" : "payroll.stats.annualHint")} />
            {data.warnings.map((warning) => (
              <Alert key={warning} type="warning" showIcon message={warning} />
            ))}
            {data.sheets.map((sheet) => {
              const columns: ColumnsType<StatFormLine> = [
                {
                  title: t("app.regulatedForms.indicator"),
                  dataIndex: "name",
                  fixed: "left",
                  width: 380,
                  render: (value: string, row) => (
                    <span className={row.isTotal ? "font-semibold" : ""} style={{ paddingLeft: (row.level - 1) * 16 }}>
                      {value}
                    </span>
                  ),
                },
                { title: t("app.regulatedForms.lineCode"), dataIndex: "code", width: 70, align: "center" },
                ...sheet.columns.map((title, index) => ({
                  title,
                  width: 120,
                  align: "right" as const,
                  render: (_: unknown, row: StatFormLine) => {
                    const value = row.values[index];
                    return value == null ? (
                      <span className="text-secondary-text">—</span>
                    ) : (
                      <span className={`tabular-nums ${row.isTotal ? "font-semibold" : ""}`}>{amount(value)}</span>
                    );
                  },
                })),
              ];
              return (
                <div key={sheet.code} className="space-y-2">
                  <div className="font-medium">{sheet.title}</div>
                  <Table<StatFormLine>
                    rowKey="code"
                    size="small"
                    bordered
                    pagination={false}
                    scroll={{ x: "max-content" }}
                    dataSource={sheet.lines}
                    columns={columns}
                  />
                  {sheet.note && <div className="text-xs text-secondary-text">{sheet.note}</div>}
                </div>
              );
            })}
          </div>
        )}
      </Spin>
    </div>
  );
}
