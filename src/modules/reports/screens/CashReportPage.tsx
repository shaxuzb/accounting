import { Link } from "react-router";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { formatDate, numberSpacing } from "@/utils/utils";
import { ReportListPage, ReportSummaryBar } from "../components";
import { cashOperationTypeOptions } from "../constants/options";
import { reportManualEndpoints } from "../constants/endpoints";
import { operationalReportPermissions } from "../constants/permissions";
import type { CashOperationReportRow } from "../types/type";

type Row = CashOperationReportRow & { indexId: number };

/** OperationTypeIdConst.IN = 1 — kassaga kirim. */
const isIncome = (row: CashOperationReportRow) => row.operationTypeId === 1;

export default function CashReportPage() {
  const { t } = useTranslation();

  const columns: TableColumnsType<Row> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), width: 64 },
    {
      dataIndex: "docNumber",
      title: t("reports.fields.docNumber"),
      render: (value, record) => (
        <Link to={`/main/cash-operationses/cash-operations/${record.id}`}>
          {value || record.id}
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("reports.fields.docDate"),
      render: (value) => formatDate(value, "DD.MM.YYYY"),
    },
    { dataIndex: "cashBoxName", title: t("reports.fields.cashBox") },
    {
      dataIndex: "operationTypeName",
      title: t("reports.fields.operationType"),
      align: "center",
    },
    {
      dataIndex: "counterpartyName",
      title: t("reports.fields.counterparty"),
      render: (value) => value || "—",
    },
    {
      dataIndex: "offsetAccountNumber",
      title: t("reports.fields.offsetAccount"),
      align: "center",
      render: (value) => value || "—",
    },
    {
      dataIndex: "amount",
      title: t("reports.fields.income"),
      align: "right",
      render: (_, record) =>
        isIncome(record) ? (
          <span className="whitespace-nowrap tabular-nums text-emerald-600 dark:text-emerald-400">
            {numberSpacing(record.amount, undefined, true)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      dataIndex: "amountOut",
      title: t("reports.fields.expense"),
      align: "right",
      render: (_, record) =>
        isIncome(record) ? (
          "—"
        ) : (
          <span className="whitespace-nowrap tabular-nums text-red-600 dark:text-red-400">
            {numberSpacing(record.amount, undefined, true)}
          </span>
        ),
    },
    {
      dataIndex: "statusName",
      title: t("settings.fields.status"),
      align: "center",
      render: (_, record) => (
        <ProcessStatusBadge
          statusId={record.statusId}
          statusName={record.statusName}
        />
      ),
    },
  ];

  return (
    <ReportListPage<CashOperationReportRow>
      report="cash"
      exportPermission={operationalReportPermissions.cash.export}
      columns={columns}
      filters={
        <>
          <SearchFilter />
          <SelectFilter
            paramKey="cashBoxId"
            placeholder="reports.fields.cashBox"
            path={reportManualEndpoints.cashBoxes}
            search
            width={200}
          />
          <SelectFilter
            paramKey="operationTypeId"
            placeholder="reports.fields.operationType"
            options={cashOperationTypeOptions}
            width={170}
          />
          <DateRangeFilter
            placeholderKeys={["reports.fields.dateFrom", "reports.fields.dateTo"]}
          />
        </>
      }
      summary={(rows, totalCount) => (
        <ReportSummaryBar
          items={[
            { labelKey: "reports.summary.operationCount", value: totalCount },
            {
              labelKey: "reports.summary.pageIncome",
              value: rows
                .filter(isIncome)
                .reduce((sum, row) => sum + (row.amount ?? 0), 0),
            },
            {
              labelKey: "reports.summary.pageExpense",
              value: rows
                .filter((row) => !isIncome(row))
                .reduce((sum, row) => sum + (row.amount ?? 0), 0),
            },
          ]}
          scopeNote={t("reports.summary.pageScopeNote")}
        />
      )}
    />
  );
}
