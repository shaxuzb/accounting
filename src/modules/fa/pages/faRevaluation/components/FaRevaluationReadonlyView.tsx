import type { ReactNode } from "react";
import { useMemo } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import {
  Boxes,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { customDate } from "@/utils/utils";
import type {
  FaRevaluation,
  FaRevaluationLineResponse,
} from "../types/type";
import FaRevaluationAccountFlow from "./FaRevaluationAccountFlow";
import useFaRevaluationLookups from "./useFaRevaluationLookups";

interface RevaluationReadonlyRow {
  key: string;
  index: number;
  inventoryNumber: string;
  assetName: string;
  newValue: number;
  assetAccount: string;
  accumulatedDepreciationAccount: string;
  note: string;
}

const joinAccount = (number?: string, name?: string) =>
  [number, name].filter(Boolean).join(" — ");

const formatAmount = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 }).format(
    Number(value ?? 0),
  );

interface FaRevaluationReadonlyViewProps {
  record: FaRevaluation;
  action?: ReactNode;
}

export default function FaRevaluationReadonlyView({
  record,
  action,
}: FaRevaluationReadonlyViewProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector(
    (state) => state.organization.name,
  );
  const lookups = useFaRevaluationLookups();

  const getAssetValues = (line: FaRevaluationLineResponse) => {
    const lookupLabel = lookups.assetLabel(line.faAssetId);
    const hasStructuredLookupLabel = lookupLabel.includes(" — ");
    const [lookupInventory = "", ...lookupNameParts] = lookupLabel.split(" — ");
    return {
      inventoryNumber:
        line.faAssetInventoryNumber ||
        line.inventoryNumber ||
        (hasStructuredLookupLabel ? lookupInventory : "") ||
        "-",
      assetName:
        line.faAssetName ||
        line.assetName ||
        lookupNameParts.join(" — ") ||
        lookupLabel ||
        String(line.faAssetId),
    };
  };

  const rows: RevaluationReadonlyRow[] = (record.lines ?? []).map(
    (line, index) => {
      const asset = getAssetValues(line);
      return {
        key: `${line.faAssetId}-${index}`,
        index: index + 1,
        inventoryNumber: asset.inventoryNumber,
        assetName: asset.assetName,
        newValue: Number(line.newValue ?? 0),
        assetAccount:
          joinAccount(line.assetAccountNumber, line.assetAccountName) ||
          lookups.accountLabel(line.assetAccountId),
        accumulatedDepreciationAccount:
          joinAccount(
            line.accumulatedDepreciationAccountNumber,
            line.accumulatedDepreciationAccountName,
          ) || lookups.accountLabel(line.accumulatedDepreciationAccountId),
        note: line.note || "-",
      };
    },
  );

  const totalNewValue = rows.reduce((total, row) => total + row.newValue, 0);
  const reserveAccount =
    joinAccount(
      record.revaluationReserveAccountNumber,
      record.revaluationReserveAccountName,
    ) || lookups.accountLabel(record.revaluationReserveAccountId);
  const lossAccount =
    joinAccount(
      record.revaluationLossAccountNumber,
      record.revaluationLossAccountName,
    ) || lookups.accountLabel(record.revaluationLossAccountId);

  const columns = useMemo<TableColumnsType<RevaluationReadonlyRow>>(
    () => [
      {
        title: t("common.rowNumber"),
        dataIndex: "index",
        align: "center",
        width: 62,
      },
      {
        title: t("fa.fields.inventoryNumber"),
        dataIndex: "inventoryNumber",
        width: 150,
        render: (value: string) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {value}
          </span>
        ),
      },
      {
        title: t("fa.fields.faAssetId"),
        dataIndex: "assetName",
        minWidth: 230,
        render: (value: string) => (
          <span className="font-medium text-text">{value}</span>
        ),
      },
      {
        title: t("fa.fields.newValue"),
        dataIndex: "newValue",
        align: "right",
        minWidth: 170,
        render: (value: number) => (
          <span className="font-semibold tabular-nums text-primary">
            {formatAmount(value)}
          </span>
        ),
      },
      {
        title: t("fa.fields.assetAccount"),
        dataIndex: "assetAccount",
        minWidth: 240,
      },
      {
        title: t("fa.fields.accumulatedDepreciationAccount"),
        dataIndex: "accumulatedDepreciationAccount",
        minWidth: 280,
      },
      {
        title: t("fa.fields.note"),
        dataIndex: "note",
        minWidth: 220,
      },
    ],
    [t],
  );

  return (
    <div className="min-w-0 space-y-4">
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={record.organizationName || organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentNumber")}
          value={record.documentNumber || `#${record.id}`}
        />
        <DocumentSummaryItem
          icon={<CalendarDays size={24} strokeWidth={1.8} />}
          label={t("fa.fields.revaluationDate")}
          value={customDate(record.revaluationDate || record.documentDate)}
        />
        <DocumentSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label={t("fa.revaluation.assetCount")}
          value={t("fa.revaluation.countValue", { count: rows.length })}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("fa.revaluation.newValuesTotal")}
          value={formatAmount(totalNewValue)}
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.reason")}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-text">
              {record.reason || record.comment || "-"}
            </div>
          </div>
          <ProcessStatusBadge
            statusId={record.statusId ?? record.stateId}
            statusName={record.statusName ?? record.stateName}
          />
        </div>
      </Card>

      <FaRevaluationAccountFlow
        reserveContent={
          <div className="font-mono text-sm font-semibold text-text">
            {reserveAccount}
          </div>
        }
        lossContent={
          <div className="font-mono text-sm font-semibold text-text">
            {lossAccount}
          </div>
        }
      />

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="border-b border-border px-4 py-3 text-base font-semibold text-heading sm:px-5">
          {t("fa.revaluation.contents")}
        </div>
        <Table<RevaluationReadonlyRow>
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="middle"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}
