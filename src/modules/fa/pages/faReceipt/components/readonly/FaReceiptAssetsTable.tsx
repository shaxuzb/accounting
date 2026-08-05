import { useMemo } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { useTranslation } from "react-i18next";
import ReadonlyDetailsCard from "@/components/fields/ReadonlyDetailsCard";
import { customDate } from "@/utils/utils";
import type { FaReceiptAsset } from "../../types/type";
import type { FaReceiptLookupKey } from "./useFaReceiptLookups";
import { formatReceiptAmount, getApiText } from "./faReceiptReadonlyUtils";

type LookupLabel = (
  key: FaReceiptLookupKey,
  id?: number | null,
  fallbackKeys?: string[],
) => string;

interface AssetRow extends FaReceiptAsset {
  key: string;
  index: number;
}

interface FaReceiptAssetsTableProps {
  assets: FaReceiptAsset[];
  currency: string;
  lineIndex: number;
  label: LookupLabel;
  accountLabel: (id?: number | null) => string;
}

export default function FaReceiptAssetsTable({
  assets,
  currency,
  lineIndex,
  label,
  accountLabel,
}: FaReceiptAssetsTableProps) {
  const { t } = useTranslation();
  const rows = useMemo<AssetRow[]>(
    () =>
      assets.map((asset, index) => ({
        ...asset,
        key: `${lineIndex}-${index}-${asset.inventoryNumber}`,
        index: index + 1,
      })),
    [assets, lineIndex],
  );

  const columns = useMemo<TableColumnsType<AssetRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        dataIndex: "index",
      },
      {
        title: t("fa.fields.inventoryNumber"),
        dataIndex: "inventoryNumber",
        align: "center",
        render: (value: string) => (
          <span className="font-mono font-semibold ">{value || "-"}</span>
        ),
      },
      {
        title: t("fa.fields.name"),
        dataIndex: "name",
        align: "center",
        render: (value: string) => (
          <span className="font-semibold text-text">{value || "-"}</span>
        ),
      },
      {
        title: t("fa.fields.faGroup"),
        dataIndex: "faGroupId",
        align: "center",
        render: (value: number, asset) =>
          getApiText(asset, "faGroupName") || label("faGroups", value),
      },
      {
        title: t("fa.fields.department"),
        dataIndex: "departmentId",
        align: "center",
        render: (value: number, asset) =>
          getApiText(asset, "departmentName") || label("departments", value),
      },
      {
        title: t("fa.fields.responsibleUser"),
        dataIndex: "responsibleUserId",
        align: "center",
        render: (value: number, asset) =>
          getApiText(asset, "responsibleUserName") ||
          label("users", value, ["fullName", "name", "username"]),
      },
      {
        title: t("fa.fields.initialCost"),
        dataIndex: "initialCost",
        align: "center",
        render: (value: number) => (
          <span className="font-semibold">
            {formatReceiptAmount(value)} {currency}
          </span>
        ),
      },
      {
        title: t("fa.fields.usefulLifeMonths"),
        dataIndex: "usefulLifeMonths",
        align: "center",
        width: 240,
        render: (value: number) => value,
      },
    ],
    [currency, label, t],
  );

  return (
    <Table<AssetRow>
      columns={columns}
      dataSource={rows}
      pagination={false}
      size="middle"
      scroll={{ x: "max-content" }}
      expandable={{
        defaultExpandedRowKeys: rows[0] ? [rows[0].key] : [],
        expandedRowRender: (asset) => (
          <div className="p-1">
            <ReadonlyDetailsCard
              className="lg:grid-cols-3 2xl:grid-cols-6"
              items={[
                {
                  label: t("fa.fields.salvageValue"),
                  value: `${formatReceiptAmount(asset.salvageValue)} ${currency}`,
                },
                {
                  label: t("fa.fields.depreciationMethod"),
                  value:
                    getApiText(asset, "depreciationMethodName") ||
                    label("depreciationMethods", asset.depreciationMethodId),
                },
                {
                  label: t("fa.fields.commissioningDate"),
                  value: customDate(asset.commissioningDate),
                },
                {
                  label: t("fa.fields.deprStartDate"),
                  value: customDate(asset.deprStartDate),
                },
                {
                  label: t("fa.fields.assetAccount"),
                  value: accountLabel(asset.assetAccountId),
                },
                {
                  label: t("fa.fields.accumulatedDepreciationAccount"),
                  value: accountLabel(asset.accumulatedDepreciationAccountId),
                },
              ]}
            />
          </div>
        ),
      }}
    />
  );
}
