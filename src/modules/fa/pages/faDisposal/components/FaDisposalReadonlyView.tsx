import type { ReactNode } from "react";
import { Table, Button } from "antd";
import type { TableColumnsType } from "antd";
import {
  Boxes,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileText, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import InventoryShortageSettlement from "@/modules/warehouse/pages/inventory-adjustment/components/InventoryShortageSettlement";
import { faDisposalTypeIds } from "../constants/disposalTypes";
import Card from "@/components/ui/card/Card";
import {
  DocumentSummary,
  DocumentSummaryItem,
} from "@/components/ui/card/DocumentSummary";
import ProcessStatusBadge from "@/components/ui/status/ProcessStatusBadge";
import { FaAssetKindField } from "../../../shared/components/FaAssetKindTag";
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
  vatAmount: number;
  reserveTransfer: number;
  /** A part liquidated (NSBU 5, 54), with the cost and depreciation it took out. */
  partPercent: number | null;
  partCost: number;
  depreciationWrittenOff: number;
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
        vatAmount: Number(line.vatAmount ?? 0),
        reserveTransfer: Number(line.reserveTransfer ?? 0),
        partPercent: line.partPercent ?? null,
        partCost: Number((line as { partCost?: number }).partCost ?? 0),
        depreciationWrittenOff: Number((line as { depreciationWrittenOff?: number }).depreciationWrittenOff ?? 0),
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
  const hasVat = rows.some((row) => row.vatAmount !== 0);
  // only a sale has a price
  const isSale = record.disposalTypeId === faDisposalTypeIds.sale;
  const hasReserve = rows.some((row) => row.reserveTransfer !== 0);

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
      label: t(record.disposalTypeId === faDisposalTypeIds.shortage ? "fa.fields.shortageAccount" : "fa.fields.lossAccount"),
      value:
        joinAccount(record.lossAccountNumber, record.lossAccountName) ||
        lookups.accountLabel(record.lossAccountId),
    },
  ];

  const columns: TableColumnsType<DisposalReadonlyRow> = [
    {
      title: t("common.rowNumber"),
      dataIndex: "index",
      align: "center",
    },
    {
      title: t("fa.fields.inventoryNumber"),
      dataIndex: "inventoryNumber",
      align: "center",
      width: 150,
      render: (value: string) => (
        <span className="font-mono font-semibold">{value}</span>
      ),
    },
    {
      title: t("fa.fields.faAssetId"),
      dataIndex: "assetName",
      align: "center",
      minWidth: 230,
      render: (value: string) => (
        <span className="font-medium text-text">{value}</span>
      ),
    },
    ...(rows.some((row) => row.partPercent)
      ? [
          {
            title: t("fa.fields.partPercent"),
            dataIndex: "partPercent",
            align: "center" as const,
            minWidth: 200,
            render: (value: number | null, row: DisposalReadonlyRow) =>
              value ? (
                <span className="tabular-nums">
                  {value}% — {numberSpacing(row.partCost)} / {numberSpacing(row.depreciationWrittenOff)}
                </span>
              ) : (
                t("fa.fields.partPercentWhole")
              ),
          },
        ]
      : []),
    ...(isSale || record.disposalTypeId === faDisposalTypeIds.gratuitous
      ? [
          {
            title: t(record.disposalTypeId === faDisposalTypeIds.gratuitous ? "fa.fields.gratuitousValue" : "fa.fields.saleAmount"),
            dataIndex: "saleAmount",
            align: "center" as const,
            minWidth: 170,
            render: (value: number) => (
              <span className="font-semibold tabular-nums text-primary">
                {numberSpacing(value)}
              </span>
            ),
          },
        ]
      : []),
    ...(hasVat
      ? [
          {
            title: t("fa.fields.vatAmount"),
            dataIndex: "vatAmount",
            align: "center" as const,
            minWidth: 140,
            render: (value: number) => (
              <span className="tabular-nums">{numberSpacing(value)}</span>
            ),
          },
        ]
      : []),
    ...(hasReserve
      ? [
          {
            title: t("fa.fields.reserveTransfer"),
            dataIndex: "reserveTransfer",
            align: "center" as const,
            minWidth: 180,
            render: (value: number) => (
              <span className="tabular-nums">{numberSpacing(value)}</span>
            ),
          },
        ]
      : []),
    {
      title: t("fa.fields.assetAccount"),
      dataIndex: "assetAccount",
      align: "center",
      minWidth: 240,
    },
    {
      title: t("fa.fields.accumulatedDepreciationAccount"),
      dataIndex: "accumulatedDepreciationAccount",
      align: "center",
      minWidth: 280,
    },
    {
      title: t("fa.fields.note"),
      dataIndex: "note",
      align: "center",
      minWidth: 220,
    },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex justify-end print:hidden">
        <Link to="print">
          <Button icon={<Printer className="size-4" />}>{t("faPrint.printOs4")}</Button>
        </Link>
      </div>
      <DocumentSummary>
        <DocumentSummaryItem
          icon={<Building2 size={24} strokeWidth={1.8} />}
          label={t("app.fields.organization")}
          value={record.organizationName || organizationName || "-"}
        />
        <DocumentSummaryItem
          icon={<FileText size={24} strokeWidth={1.8} />}
          label={t("fa.fields.documentNumber")}
          value={record.docNumber || record.documentNumber || `#${record.id}`}
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
        {isSale && (
          <DocumentSummaryItem
            icon={<CircleDollarSign size={24} strokeWidth={1.8} />}
            label={t("fa.sections.totalSaleAmount")}
            value={numberSpacing(totalSaleAmount)}
            emphasized
          />
        )}
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
          {record.inventoryDocId && (
            <div className="min-w-40">
              <div className="text-xs text-secondary-text">
                {t("fa.inventory.title")}
              </div>
              <div className="mt-0.5 text-sm font-semibold">
                <Link to={`/main/fa/inventories/${record.inventoryDocId}`}>
                  № {record.inventoryDocNumber ?? record.inventoryDocId}
                </Link>
              </div>
            </div>
          )}
          {record.counterpartyName && (
            <div className="min-w-40">
              <div className="text-xs text-secondary-text">
                {t("fa.fields.buyer")}
              </div>
              <div className="mt-0.5 text-sm font-semibold text-text">
                {record.counterpartyName}
                {record.contractNumber ? ` · ${record.contractNumber}` : ""}
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs text-secondary-text">
              {t("fa.fields.reason")}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-text">
              {record.reason || record.comment || "-"}
            </div>
          </div>
          <FaAssetKindField assetKindId={record.assetKindId} />
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
              <div className="mt-1  font-mono text-sm font-semibold text-text">
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

      {record.disposalTypeId === faDisposalTypeIds.shortage && record.statusId === 2 && (
        <div className="max-w-md">
          <InventoryShortageSettlement
            adjustmentId={record.id}
            statusPath={`fa/disposals/${record.id}/shortage`}
            settlePath={`fa/disposals/${record.id}/shortage/settle`}
          />
        </div>
      )}

      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}
