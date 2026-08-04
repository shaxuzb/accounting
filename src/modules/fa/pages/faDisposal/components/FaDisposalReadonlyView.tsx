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
import { customDate, numberSpacing } from "@/utils/utils";
import type { FaDisposalLineItem, FaDisposalResponse } from "../types/type";
import useFaDisposalLookups from "./useFaDisposalLookups";

interface DisposalReadonlyRow {
  key: string;
  index: number;
  inventoryNumber: string;
  assetName: string;
  saleAmount: number;
  assetAccount: string;
  accumulatedDepreciationAccount: string;
  note: string;
}

const joinAccount = (number?: string, name?: string) =>
  [number, name].filter(Boolean).join(" — ");

interface FaDisposalReadonlyViewProps {
  record: FaDisposalResponse;
  action?: ReactNode;
}

export default function FaDisposalReadonlyView({
  record,
  action,
}: FaDisposalReadonlyViewProps) {
  const { t } = useTranslation();
  const organizationName = useAppSelector((state) => state.organization.name);
  const lookups = useFaDisposalLookups();

  const getAssetValues = (line: FaDisposalLineItem) => {
    const lookupLabel = lookups.assetLabel(line.faAssetId);
    const [lookupInventory = "", ...lookupNameParts] = lookupLabel.split(" — ");
    return {
      inventoryNumber:
        line.faAssetInventoryNumber ||
        line.inventoryNumber ||
        (lookupNameParts.length ? lookupInventory : "") ||
        "-",
      assetName:
        line.faAssetName ||
        line.assetName ||
        lookupNameParts.join(" — ") ||
        lookupLabel ||
        String(line.faAssetId),
    };
  };

  const rows: DisposalReadonlyRow[] = (record.lines ?? []).map(
    (line, index) => {
      const asset = getAssetValues(line);
      return {
        key: `${line.faAssetId}-${index}`,
        index: index + 1,
        inventoryNumber: asset.inventoryNumber,
        assetName: asset.assetName,
        saleAmount: Number(line.saleAmount ?? 0),
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

  const totalSaleAmount = rows.reduce(
    (total, row) => total + row.saleAmount,
    0,
  );

  const accountItems = [
    {
      label: t("fa.fields.disposalAccount"),
      value:
        joinAccount(record.disposalAccountNumber, record.disposalAccountName) ||
        lookups.accountLabel(record.disposalAccountId),
    },
    {
      label: t("fa.fields.customerAccount"),
      value:
        joinAccount(record.customerAccountNumber, record.customerAccountName) ||
        lookups.accountLabel(record.customerAccountId),
    },
    {
      label: t("fa.fields.vatAccount"),
      value:
        joinAccount(record.vatAccountNumber, record.vatAccountName) ||
        lookups.accountLabel(record.vatAccountId),
    },
    {
      label: t("fa.fields.gainAccount"),
      value:
        joinAccount(record.gainAccountNumber, record.gainAccountName) ||
        lookups.accountLabel(record.gainAccountId),
    },
    {
      label: t("fa.fields.lossAccount"),
      value:
        joinAccount(record.lossAccountNumber, record.lossAccountName) ||
        lookups.accountLabel(record.lossAccountId),
    },
  ];

  const columns = useMemo<TableColumnsType<DisposalReadonlyRow>>(
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
        title: t("fa.fields.saleAmount"),
        dataIndex: "saleAmount",
        align: "right",
        minWidth: 170,
        render: (value: number) => (
          <span className="font-semibold tabular-nums text-primary">
            {numberSpacing(value)}
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
          label={t("fa.fields.disposalDate")}
          value={customDate(record.disposalDate || record.documentDate)}
        />
        <DocumentSummaryItem
          icon={<Boxes size={24} strokeWidth={1.8} />}
          label={t("fa.disposal.assetCount")}
          value={t("fa.disposal.countValue", { count: rows.length })}
        />
        <DocumentSummaryItem
          icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
          label={t("fa.sections.totalSaleAmount")}
          value={numberSpacing(totalSaleAmount)}
          emphasized
        />
      </DocumentSummary>

      <Card className="border border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
          <div className="min-w-40">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.disposalType")}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-text">
              {record.disposalTypeName ||
                lookups.disposalTypeLabel(record.disposalTypeId)}
            </div>
          </div>
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

      <Card className="border border-border p-4 sm:p-5">
        <div className="mb-3 text-base font-semibold text-heading">
          {t("fa.sections.accounts")}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {accountItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-surface-muted px-3 py-2.5"
            >
              <div className="text-xs text-secondary-text">{item.label}</div>
              <div className="mt-1 break-words font-mono text-sm font-semibold text-text">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="min-w-0 overflow-hidden border border-border">
        <div className="border-b border-border px-4 py-3 text-base font-semibold text-heading sm:px-5">
          {t("fa.disposal.contents")}
        </div>
        <Table<DisposalReadonlyRow>
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
