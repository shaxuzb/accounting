import { Alert, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import * as XLSX from "xlsx";
import { usePersistedState, useScopedStorageKey } from "@/shared/persistence/usePersistedState";
import { usePropertyTax, type PropertyTaxRow } from "./api";
import { PeriodBar, TaxHeader, TaxReportShell, taxAmount } from "./shared";

/**
 * The property tax of legal entities (Tax Code, ch. 59) from January to a month: by object, the
 * residual values at the month ends, the average annual value (their sum over twelve, art. 413),
 * the minimum by the area (art. 412), the base and the tax at the object's rate (art. 415).
 */
export default function PropertyTaxPage() {
  const { t } = useTranslation();
  const key = useScopedStorageKey("report-state", "tax-property");
  const last = dayjs().subtract(1, "month");
  const [state, setState] = usePersistedState<{ year: number; month: number }>(
    key,
    { year: last.year(), month: last.month() + 1 },
    { debounceMs: 0 },
  );
  const query = usePropertyTax(state);
  const report = query.data;
  const title = t("app.taxReports.propertyTaxTitle");
  const months = Array.from({ length: state.month }, (_, i) => i);

  const columns: ColumnsType<PropertyTaxRow> = [
    {
      key: "asset",
      title: t("app.taxReports.propertyObject"),
      fixed: "left",
      width: 220,
      render: (_, row) => (
        <Link to={`/main/fa/assets/edit/${row.assetId}`}>
          {row.inventoryNumber} · {row.name}
          {row.accountNumber ? ` (${row.accountNumber})` : ""}
        </Link>
      ),
    },
    ...months.map((i) => ({
      key: `m${i}`,
      title: dayjs().month(i).format("MMM"),
      align: "right" as const,
      width: 120,
      render: (_: unknown, row: PropertyTaxRow) => taxAmount(row.monthValues[i]),
    })),
    { key: "avg", title: t("app.taxReports.averageValue"), align: "right", width: 140, render: (_, row) => taxAmount(row.averageValue) },
    {
      key: "min",
      title: t("app.taxReports.minimumValue"),
      align: "right",
      width: 150,
      render: (_, row) =>
        row.minimumValue ? (
          <span>
            {taxAmount(row.minimumValue)} {row.minimumApplied && <Tag color="orange">{t("app.taxReports.minimumApplied")}</Tag>}
          </span>
        ) : (
          "—"
        ),
    },
    { key: "base", title: t("app.taxReports.taxBase"), align: "right", width: 140, render: (_, row) => <b>{taxAmount(row.base)}</b> },
    { key: "rate", title: t("app.taxReports.rateColumn"), align: "right", width: 70, render: (_, row) => `${row.rate} %` },
    { key: "tax", title: t("app.taxReports.taxAmount"), align: "right", width: 130, render: (_, row) => <b>{taxAmount(row.tax)}</b> },
  ];

  const exportXlsx = () => {
    if (!report) return;
    const header = [
      t("app.taxReports.propertyObject"),
      ...months.map((i) => dayjs().month(i).format("MMM")),
      t("app.taxReports.averageValue"),
      t("app.taxReports.minimumValue"),
      t("app.taxReports.taxBase"),
      t("app.taxReports.rateColumn"),
      t("app.taxReports.taxAmount"),
    ];
    const rows = report.rows.map((row) => [
      `${row.inventoryNumber} ${row.name}`,
      ...months.map((i) => row.monthValues[i] ?? 0),
      row.averageValue,
      row.minimumValue,
      row.base,
      row.rate,
      row.tax,
    ]);
    const sheet = XLSX.utils.aoa_to_sheet([[title], [report.header.organizationName], [], header, ...rows]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Mol-mulk");
    XLSX.writeFile(book, `mol-mulk-solig-${state.year}-${String(state.month).padStart(2, "0")}.xlsx`);
  };

  return (
    <TaxReportShell>
      <PeriodBar
        year={state.year}
        onYear={(year) => setState({ ...state, year })}
        month={state.month}
        onMonth={(month) => setState({ ...state, month })}
        loading={query.isFetching}
        onRefresh={() => void query.refetch()}
        onExport={report ? exportXlsx : undefined}
      />
      <Spin spinning={query.isFetching}>
        {report && (
          <div className="space-y-4">
            {report.warnings.map((warning) => (
              <Alert key={warning} type="warning" showIcon message={warning} />
            ))}
            <TaxHeader
              header={report.header}
              title={title}
              period={t("app.taxReports.propertyTaxPeriod", { year: report.year, month: dayjs().month(report.month - 1).format("MMMM") })}
            />
            <Alert type="info" showIcon message={t("app.taxReports.propertyTaxHint")} />
            <Table<PropertyTaxRow>
              rowKey="assetId"
              size="small"
              bordered
              pagination={false}
              scroll={{ x: "max-content" }}
              dataSource={report.rows}
              columns={columns}
              locale={{ emptyText: t("app.taxReports.propertyTaxNone") }}
              summary={() =>
                report.rows.length > 0 ? (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={months.length + 3}>
                      <b>{t("app.taxReports.total")}</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <b>{taxAmount(report.totalBase)}</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                    <Table.Summary.Cell index={3} align="right">
                      <b>{taxAmount(report.totalTax)}</b>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                ) : null
              }
            />
          </div>
        )}
      </Spin>
    </TaxReportShell>
  );
}
