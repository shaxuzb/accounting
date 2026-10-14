import { Alert, InputNumber, Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import type { FaAssetOutputRow } from "../types/type";

const formatUnits = (value: number) =>
  value.toLocaleString("ru-RU", { maximumFractionDigits: 4 }).replace(/,/g, ".");

/**
 * The month's output of the assets depreciated by units of production (1C «Выработка ОС»): the
 * depreciation is the value left times the month's units over the planned units left, and a
 * month without output has none (NSBU 5).
 */
export default function FaAssetOutputTable({
  rows,
  locked,
  onChange,
}: {
  rows: FaAssetOutputRow[];
  locked: boolean;
  onChange: (faAssetId: number, units: number | null) => void;
}) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;

  const columns: TableColumnsType<FaAssetOutputRow> = [
    { title: t("fa.fields.inventoryNumber"), dataIndex: "inventoryNumber", width: 140 },
    { title: t("fa.fields.name"), dataIndex: "assetName", minWidth: 200 },
    {
      title: t("fa.output.planned"),
      dataIndex: "plannedUnitsTotal",
      align: "right",
      width: 140,
      render: (value: number) => formatUnits(value),
    },
    {
      title: t("fa.output.before"),
      dataIndex: "unitsBefore",
      align: "right",
      width: 140,
      render: (value: number) => formatUnits(value),
    },
    {
      title: t("fa.output.month"),
      dataIndex: "units",
      align: "right",
      width: 170,
      render: (value: number | null, row) => (
        <InputNumber
          min={0}
          value={value ?? undefined}
          disabled={locked}
          className="w-full"
          onChange={(next) => onChange(row.faAssetId, next == null ? null : Number(next))}
        />
      ),
    },
  ];

  return (
    <div className="mb-4 space-y-2">
      <div className="text-sm font-medium">{t("fa.output.title")}</div>
      <div className="text-xs text-secondary-text">{t("fa.output.hint")}</div>
      {locked && <Alert type="info" showIcon message={t("fa.output.locked")} />}
      <Table<FaAssetOutputRow>
        size="small"
        rowKey="faAssetId"
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
}
