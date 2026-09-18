import { Link } from "react-router";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import DateRangeFilter from "@/components/ui/filters/DateRangeFilter";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { formatDate } from "@/utils/utils";
import { ReportListPage } from "../components";
import { documentStatusOptions } from "../constants/options";
import { reportManualEndpoints } from "../constants/endpoints";
import { operationalReportPermissions } from "../constants/permissions";
import type { WarehouseTransferReportRow } from "../types/type";

type Row = WarehouseTransferReportRow & { indexId: number };

export default function WarehouseTransferReportPage() {
  const { t } = useTranslation();

  const columns: TableColumnsType<Row> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), width: 64 },
    {
      dataIndex: "docNumber",
      title: t("reports.fields.docNumber"),
      render: (value, record) => (
        <Link to={`/main/warehouses/transfers/${record.id}`}>
          {value || record.id}
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("reports.fields.docDate"),
      render: (value) => formatDate(value, "DD.MM.YYYY"),
    },
    {
      dataIndex: "sourceWarehouseName",
      title: t("reports.fields.sourceWarehouse"),
    },
    {
      dataIndex: "destinationWarehouseName",
      title: t("reports.fields.destinationWarehouse"),
    },
    {
      dataIndex: "comment",
      title: t("reports.fields.comment"),
      render: (value) => value || "—",
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
    <ReportListPage<WarehouseTransferReportRow>
      report="warehouseTransfers"
      exportPermission={
        operationalReportPermissions.warehouseTransfers.export
      }
      columns={columns}
      filters={
        <>
          <SearchFilter />
          <SelectFilter
            paramKey="sourceWarehouseId"
            placeholder="reports.fields.sourceWarehouse"
            path={reportManualEndpoints.warehouses}
            width={200}
          />
          <SelectFilter
            paramKey="destinationWarehouseId"
            placeholder="reports.fields.destinationWarehouse"
            path={reportManualEndpoints.warehouses}
            width={200}
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
    />
  );
}
