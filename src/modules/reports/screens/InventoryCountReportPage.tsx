import { Link } from "react-router";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/filters/SearchFilter";
import SelectFilter from "@/components/ui/filters/SelectFilter";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { formatDate } from "@/utils/utils";
import { ReportListPage } from "../components";
import { documentStatusOptions } from "../constants/options";
import { reportManualEndpoints } from "../constants/endpoints";
import { operationalReportPermissions } from "../constants/permissions";
import type { InventoryCountReportRow } from "../types/type";

type Row = InventoryCountReportRow & { indexId: number };

/**
 * Inventarizatsiya endpointida sana filtri yo'q
 * (InventoryCountListFilter: search, warehouseId, statusId) — shuning uchun
 * bu sahifada sana oralig'i ko'rsatilmaydi.
 */
export default function InventoryCountReportPage() {
  const { t } = useTranslation();

  const columns: TableColumnsType<Row> = [
    { dataIndex: "indexId", title: t("common.rowNumber"), width: 64 },
    {
      dataIndex: "docNumber",
      title: t("reports.fields.docNumber"),
      render: (value, record) => (
        <Link to={`/main/warehouses/inventory-counts/${record.id}`}>
          {value || record.id}
        </Link>
      ),
    },
    {
      dataIndex: "docDate",
      title: t("reports.fields.docDate"),
      render: (value) => formatDate(value, "DD.MM.YYYY"),
    },
    { dataIndex: "warehouseName", title: t("reports.fields.warehouse") },
    {
      dataIndex: "countCompletedAt",
      title: t("reports.fields.countCompletedAt"),
      render: (value) => (value ? formatDate(value) : "—"),
    },
    {
      dataIndex: "postedAt",
      title: t("reports.fields.postedAt"),
      render: (value) => (value ? formatDate(value) : "—"),
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
    <ReportListPage<InventoryCountReportRow>
      report="inventoryCounts"
      exportPermission={operationalReportPermissions.inventoryCounts.export}
      columns={columns}
      filters={
        <>
          <SearchFilter />
          <SelectFilter
            paramKey="warehouseId"
            placeholder="reports.fields.warehouse"
            path={reportManualEndpoints.warehouses}
            width={200}
          />
          <SelectFilter
            paramKey="statusId"
            placeholder="settings.fields.status"
            options={documentStatusOptions}
            width={160}
          />
        </>
      }
    />
  );
}
