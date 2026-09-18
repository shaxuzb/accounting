import { Link } from "react-router";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { formatDate, numberSpacing } from "@/utils/utils";
import { ReportListPage, ReportSummaryBar } from "../components";
import { documentStatusOptions } from "../constants/options";
import { reportManualEndpoints } from "../constants/endpoints";
import { operationalReportPermissions } from "../constants/permissions";
import type { SalesReportRow } from "../types/type";

type Row = SalesReportRow & { indexId: number };

export default function SalesReportPage() {
  const { t } = useTranslation();

  const columns: TableColumnsType<Row> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), width: 64 },
    {
      dataIndex: "docNumber",
      title: t("reports.fields.docNumber"),
      render: (value, record) => (
        <Link to={`/main/sales/sale/${record.id}`}>{value || record.id}</Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("reports.fields.docDate"),
      render: (value) => formatDate(value, "DD.MM.YYYY"),
    },
    { dataIndex: "counterpartyName", title: t("reports.fields.customer") },
    { dataIndex: "warehouseName", title: t("reports.fields.warehouse") },
    {
      dataIndex: "contractNumber",
      title: t("reports.fields.contract"),
      render: (value) => value || "—",
    },
    {
      dataIndex: "finalAmount",
      title: t("reports.fields.amount"),
      align: "right",
      render: (_, record) => (
        <span className="whitespace-nowrap tabular-nums">
          {numberSpacing(record.finalAmount ?? record.totalAmount, undefined, true)}{" "}
          {record.currencyCode || record.currencyName || ""}
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
    <ReportListPage<SalesReportRow>
      report="sales"
      exportPermission={operationalReportPermissions.sales.export}
      columns={columns}
      filters={
        <>
          <SearchFilter />
          <SelectFilter
            paramKey="counterpartyId"
            placeholder="reports.fields.customer"
            path={reportManualEndpoints.counterparties}
            search
            width={220}
          />
          <SelectFilter
            paramKey="warehouseId"
            placeholder="reports.fields.warehouse"
            path={reportManualEndpoints.warehouses}
            width={180}
          />
          <SelectFilter
            paramKey="statusId"
            placeholder="settings.fields.status"
            options={documentStatusOptions}
            width={160}
          />
          <DateRangeFilter
            placeholderKeys={["reports.fields.dateFrom", "reports.fields.dateTo"]}
          />
        </>
      }
      summary={(rows, totalCount) => (
        <ReportSummaryBar
          items={[
            { labelKey: "reports.summary.documentCount", value: totalCount },
            {
              labelKey: "reports.summary.pageAmount",
              value: rows.reduce(
                (sum, row) => sum + (row.finalAmount ?? row.totalAmount ?? 0),
                0,
              ),
            },
          ]}
          scopeNote={t("reports.summary.pageScopeNote")}
        />
      )}
    />
  );
}
