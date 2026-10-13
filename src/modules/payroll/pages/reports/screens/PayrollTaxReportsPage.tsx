import { Button, DatePicker, Empty, Table, Tabs, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs, { type Dayjs } from "dayjs";
import * as XLSX from "xlsx";
import Card from "@/components/ui/card/Card";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import { $axiosPrivate } from "@/services/AxiosService";

interface TaxRow {
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  pinfl?: string | null;
  tin?: string | null;
  isTaxResident: boolean;
  income: number;
  exemptIncome: number;
  privilege: number;
  incomeTaxBase: number;
  incomeTax: number;
  inps: number;
  incomeTaxToBudget: number;
  socialTaxBase: number;
  socialTax: number;
}

interface TaxReport {
  year: number;
  month: number;
  organizationName: string;
  organizationTin?: string | null;
  rows: TaxRow[];
  total: TaxRow;
}

interface StatementMonth {
  month: number;
  income: number;
  exemptIncome: number;
  incomeTax: number;
  inps: number;
}

interface IncomeStatement {
  year: number;
  employeeName: string;
  pinfl?: string | null;
  tin?: string | null;
  organizationName: string;
  organizationTin?: string | null;
  months: StatementMonth[];
  total: StatementMonth;
}

interface LaborMonth {
  year: number;
  month: number;
  listedAtEnd: number;
  averageListed: number;
  averageOther: number;
  hired: number;
  dismissed: number;
  wageFund: number;
  averageWage: number;
}

interface LaborStatistics {
  months: LaborMonth[];
  averageListed: number;
  wageFund: number;
  averageWage: number;
  hired: number;
  dismissed: number;
}

const money = (value?: number | null) =>
  Number(value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const exportSheet = (name: string, rows: Record<string, unknown>[]) => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Sheet1");
  XLSX.writeFile(book, `${name}.xlsx`);
};

/** The month's personal income tax and social tax calculation with its per-employee appendix. */
function TaxCalculationTab() {
  const { t } = useTranslation();
  const [month, setMonth] = useState<Dayjs>(dayjs().subtract(1, "month"));
  const { data, isFetching } = useQuery({
    queryKey: ["payroll-tax-calculation", month.year(), month.month() + 1],
    queryFn: () =>
      $axiosPrivate
        .get<TaxReport>("payroll/reports/tax-calculation", { params: { year: month.year(), month: month.month() + 1 } })
        .then((r) => r.data),
  });
  const columns: TableColumnsType<TaxRow> = [
    { dataIndex: "employeeName", title: t("payroll.fields.employee"), fixed: "left", width: 220 },
    { dataIndex: "pinfl", title: t("payroll.taxReports.pinfl"), width: 150 },
    {
      dataIndex: "isTaxResident",
      title: t("payroll.taxReports.resident"),
      width: 90,
      render: (v: boolean) => <Tag color={v ? "green" : "orange"}>{t(v ? "payroll.taxReports.yes" : "payroll.taxReports.no")}</Tag>,
    },
    { dataIndex: "income", title: t("payroll.taxReports.income"), align: "right", render: money },
    { dataIndex: "exemptIncome", title: t("payroll.taxReports.exemptIncome"), align: "right", render: money },
    { dataIndex: "privilege", title: t("payroll.taxReports.privilege"), align: "right", render: money },
    { dataIndex: "incomeTaxBase", title: t("payroll.taxReports.incomeTaxBase"), align: "right", render: money },
    { dataIndex: "incomeTax", title: t("payroll.taxReports.incomeTax"), align: "right", render: money },
    { dataIndex: "inps", title: "INPS", align: "right", render: money },
    { dataIndex: "incomeTaxToBudget", title: t("payroll.taxReports.toBudget"), align: "right", render: money },
    { dataIndex: "socialTaxBase", title: t("payroll.taxReports.socialTaxBase"), align: "right", render: money },
    { dataIndex: "socialTax", title: t("payroll.taxReports.socialTax"), align: "right", render: money },
  ];
  const exportRows = () =>
    exportSheet(`jshds-ijtimoiy-${month.format("YYYY-MM")}`, (data?.rows ?? []).map((row, index) => ({
      "№": index + 1,
      [t("payroll.fields.employee")]: row.employeeName,
      [t("payroll.taxReports.pinfl")]: row.pinfl ?? "",
      [t("payroll.taxReports.resident")]: row.isTaxResident ? 1 : 0,
      [t("payroll.taxReports.income")]: row.income,
      [t("payroll.taxReports.exemptIncome")]: row.exemptIncome,
      [t("payroll.taxReports.privilege")]: row.privilege,
      [t("payroll.taxReports.incomeTaxBase")]: row.incomeTaxBase,
      [t("payroll.taxReports.incomeTax")]: row.incomeTax,
      INPS: row.inps,
      [t("payroll.taxReports.toBudget")]: row.incomeTaxToBudget,
      [t("payroll.taxReports.socialTaxBase")]: row.socialTaxBase,
      [t("payroll.taxReports.socialTax")]: row.socialTax,
    })));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <DatePicker picker="month" format="MM.YYYY" allowClear={false} value={month} onChange={(v) => v && setMonth(v)} />
        <Button icon={<FileSpreadsheet className="size-4" />} disabled={!data?.rows.length} onClick={exportRows}>
          Excel
        </Button>
        <span className="text-xs text-secondary-text">{t("payroll.taxReports.calculationHint")}</span>
      </div>
      <Table<TaxRow>
        rowKey="employeeId"
        size="small"
        loading={isFetching}
        columns={columns}
        dataSource={data?.rows ?? []}
        pagination={false}
        scroll={{ x: "max-content" }}
        summary={() =>
          data && data.rows.length > 0 ? (
            <Table.Summary.Row className="font-semibold">
              <Table.Summary.Cell index={0} colSpan={3}>{t("payroll.leave.total")}</Table.Summary.Cell>
              {(["income", "exemptIncome", "privilege", "incomeTaxBase", "incomeTax", "inps", "incomeTaxToBudget", "socialTaxBase", "socialTax"] as const).map((key, i) => (
                <Table.Summary.Cell key={key} index={i + 3} align="right">{money(data.total[key])}</Table.Summary.Cell>
              ))}
            </Table.Summary.Row>
          ) : null
        }
      />
    </div>
  );
}

/** An employee's income and the taxes withheld from it over a year. */
function IncomeStatementTab() {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [year, setYear] = useState<Dayjs>(dayjs());
  const { data, isFetching } = useQuery({
    queryKey: ["payroll-income-statement", employeeId, year.year()],
    queryFn: () =>
      $axiosPrivate
        .get<IncomeStatement>("payroll/reports/income-statement", { params: { employeeId, year: year.year() } })
        .then((r) => r.data),
    enabled: Boolean(employeeId),
  });
  const columns: TableColumnsType<StatementMonth> = [
    { dataIndex: "month", title: t("payroll.leave.month"), render: (m: number) => dayjs().month(m - 1).format("MMMM") },
    { dataIndex: "income", title: t("payroll.taxReports.income"), align: "right", render: money },
    { dataIndex: "exemptIncome", title: t("payroll.taxReports.exemptIncome"), align: "right", render: money },
    { dataIndex: "incomeTax", title: t("payroll.taxReports.incomeTax"), align: "right", render: money },
    { dataIndex: "inps", title: "INPS", align: "right", render: money },
  ];
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
        <PayrollEmployeeSelect standalone value={employeeId} onChange={setEmployeeId} />
        <DatePicker picker="year" allowClear={false} value={year} onChange={(v) => v && setYear(v)} />
        <Button
          icon={<FileSpreadsheet className="size-4" />}
          disabled={!data}
          onClick={() =>
            data &&
            exportSheet(`daromad-${data.employeeName}-${data.year}`, data.months.map((m) => ({
              [t("payroll.leave.month")]: m.month,
              [t("payroll.taxReports.income")]: m.income,
              [t("payroll.taxReports.exemptIncome")]: m.exemptIncome,
              [t("payroll.taxReports.incomeTax")]: m.incomeTax,
              INPS: m.inps,
            })))
          }
        >
          Excel
        </Button>
      </div>
      {!employeeId ? (
        <Empty description={t("payroll.taxReports.chooseEmployee")} />
      ) : (
        data && (
          <Card className="border border-border p-4">
            <div className="mb-3 text-sm">
              <div className="font-semibold">{data.organizationName} {data.organizationTin ? `(STIR ${data.organizationTin})` : ""}</div>
              <div>
                {data.employeeName}
                {data.pinfl ? ` · JShShIR ${data.pinfl}` : ""} · {data.year}
              </div>
            </div>
            <Table<StatementMonth>
              rowKey="month"
              size="small"
              loading={isFetching}
              columns={columns}
              dataSource={data.months}
              pagination={false}
              summary={() => (
                <Table.Summary.Row className="font-semibold">
                  <Table.Summary.Cell index={0}>{t("payroll.leave.total")}</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">{money(data.total.income)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">{money(data.total.exemptIncome)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">{money(data.total.incomeTax)}</Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">{money(data.total.inps)}</Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        )
      )}
    </div>
  );
}

/** The labour figures of the statistics form 1-T. */
function LaborStatisticsTab() {
  const { t } = useTranslation();
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(2, "month").startOf("month"), dayjs().endOf("month")]);
  const from = range[0].startOf("month").format("YYYY-MM-DD");
  const to = range[1].endOf("month").format("YYYY-MM-DD");
  const { data, isFetching } = useQuery({
    queryKey: ["payroll-labor-statistics", from, to],
    queryFn: () => $axiosPrivate.get<LaborStatistics>("payroll/reports/labor-statistics", { params: { from, to } }).then((r) => r.data),
  });
  const columns: TableColumnsType<LaborMonth> = [
    { key: "month", title: t("payroll.leave.month"), render: (_, m) => `${String(m.month).padStart(2, "0")}.${m.year}` },
    { dataIndex: "listedAtEnd", title: t("payroll.stats.listedAtEnd"), align: "right" },
    { dataIndex: "averageListed", title: t("payroll.stats.averageListed"), align: "right" },
    { dataIndex: "averageOther", title: t("payroll.stats.averageOther"), align: "right" },
    { dataIndex: "hired", title: t("payroll.stats.hired"), align: "right" },
    { dataIndex: "dismissed", title: t("payroll.stats.dismissed"), align: "right" },
    { dataIndex: "wageFund", title: t("payroll.stats.wageFund"), align: "right", render: money },
    { dataIndex: "averageWage", title: t("payroll.stats.averageWage"), align: "right", render: money },
  ];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <DatePicker.RangePicker picker="month" format="MM.YYYY" allowClear={false} value={range} onChange={(v) => v?.[0] && v[1] && setRange([v[0], v[1]])} />
        <Button
          icon={<FileSpreadsheet className="size-4" />}
          disabled={!data?.months.length}
          onClick={() =>
            data &&
            exportSheet(`1-T-${from}-${to}`, data.months.map((m) => ({
              [t("payroll.leave.month")]: `${m.month}.${m.year}`,
              [t("payroll.stats.listedAtEnd")]: m.listedAtEnd,
              [t("payroll.stats.averageListed")]: m.averageListed,
              [t("payroll.stats.averageOther")]: m.averageOther,
              [t("payroll.stats.hired")]: m.hired,
              [t("payroll.stats.dismissed")]: m.dismissed,
              [t("payroll.stats.wageFund")]: m.wageFund,
              [t("payroll.stats.averageWage")]: m.averageWage,
            })))
          }
        >
          Excel
        </Button>
        <span className="text-xs text-secondary-text">{t("payroll.stats.hint")}</span>
      </div>
      <Table<LaborMonth>
        rowKey={(m) => `${m.year}-${m.month}`}
        size="small"
        loading={isFetching}
        columns={columns}
        dataSource={data?.months ?? []}
        pagination={false}
        summary={() =>
          data ? (
            <Table.Summary.Row className="font-semibold">
              <Table.Summary.Cell index={0} colSpan={2}>{t("payroll.leave.total")}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right">{data.averageListed}</Table.Summary.Cell>
              <Table.Summary.Cell index={3} />
              <Table.Summary.Cell index={4} align="right">{data.hired}</Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">{data.dismissed}</Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">{money(data.wageFund)}</Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">{money(data.averageWage)}</Table.Summary.Cell>
            </Table.Summary.Row>
          ) : null
        }
      />
    </div>
  );
}

/** The payroll's tax and statistics reports. */
export default function PayrollTaxReportsPage() {
  const { t } = useTranslation();
  return (
    <Card className="border border-border p-4">
      <Tabs
        items={[
          { key: "tax", label: t("payroll.taxReports.calculationTitle"), children: <TaxCalculationTab /> },
          { key: "statement", label: t("payroll.taxReports.statementTitle"), children: <IncomeStatementTab /> },
          { key: "stats", label: t("payroll.stats.title"), children: <LaborStatisticsTab /> },
        ]}
      />
    </Card>
  );
}
