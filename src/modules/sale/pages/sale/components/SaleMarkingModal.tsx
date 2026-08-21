import { Button, Modal, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { customDate, numberSpacing } from "@/utils/utils";
import type { SaleProductMarking } from "../types/type";
import BarcodeScannerInput from "./BarcodeScannerInput";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  productName: string;
  quantity: number;
  markings: SaleProductMarking[];
  batches?: SaleMarkingBatchSummary[];
  loading?: boolean;
  onScan: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export interface SaleMarkingBatchSummary {
  batchId: number;
  batchNumber: string;
  batchDate?: string;
  documentId?: number | null;
  documentNumber?: string;
  quantity: number;
  selectedQuantity: number;
}

interface MarkingRow {
  key: string;
  markingNumber: string | null;
  selected: boolean;
}

export default function SaleMarkingModal({
  open,
  productName,
  quantity,
  markings,
  batches = [],
  loading = false,
  onScan,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [isProductExpanded, setIsProductExpanded] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState<Record<number, boolean>>(
    {},
  );
  const isComplete = quantity > 0 && markings.length === quantity;
  const batchRows = (batch: SaleMarkingBatchSummary): MarkingRow[] => {
    const batchMarkings = markings.filter(
      (marking) => marking.batchId === batch.batchId,
    );

    return Array.from(
      { length: Math.max(0, Math.round(batch.quantity)) },
      (_, index) => ({
        key: `${batch.batchId}-${index}`,
        markingNumber: batchMarkings[index]?.markingNumber ?? null,
        selected: Boolean(batchMarkings[index]),
      }),
    );
  };
  const columns: TableColumnsType<MarkingRow> = [
    {
      title: t("common.rowNumber"),
      width: 56,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: t("openingInventory.fields.quantity"),
      width: 100,
      align: "center",
      render: () => `1 ${t("sale.fields.piece")}`,
    },
    {
      dataIndex: "markingNumber",
      title: t("app.fields.marking"),
      ellipsis: true,
      render: (value: string | null) => value || "-",
    },
    {
      title: t("sale.fields.status"),
      width: 140,
      align: "center",
      render: (_, row) =>
        row.selected ? (
          <Tag color="success">{t("sale.fields.marked")}</Tag>
        ) : (
          <Tag>{t("sale.fields.notMarked")}</Tag>
        ),
    },
  ];

  return (
    <Modal maskClosable={false}
      open={open}
      title={t("sale.actions.confirmMarking")}
      destroyOnHidden
      closable={!loading}
      onCancel={onClose}
      width={1100}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>{t("common.close")}</Button>
          <Button
            type="primary"
            icon={<CheckCircle2 className="size-4" />}
            disabled={loading || !isComplete}
            onClick={onConfirm}
          >
            {t("common.confirm")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-md border border-dashed border-info/50 bg-info-soft/50 p-3">
          <div className="mb-2 text-sm font-semibold text-info">
            {t("sale.messages.scanOrEnterMarking")}
          </div>
          <BarcodeScannerInput
            disabled={isComplete}
            loading={loading}
            onScan={onScan}
          />
        </div>
        <div
          className={`overflow-hidden rounded-md border ${
            isComplete
              ? "border-success/50 bg-success-soft/40"
              : "border-border"
          }`}
        >
          <button
            type="button"
            className={`grid w-full gap-3 border-b px-3 py-3 text-left transition-colors md:grid-cols-[auto_minmax(260px,1fr)_160px_160px] ${
              isComplete
                ? "border-success/40 bg-success-soft/70 hover:bg-success-soft"
                : "border-border bg-surface-muted hover:bg-surface-hover"
            }`}
            aria-expanded={isProductExpanded}
            onClick={() => setIsProductExpanded((current) => !current)}
          >
            <span className="flex items-center justify-center text-secondary-text">
              {isProductExpanded ? (
                <ChevronDown className="size-5" />
              ) : (
                <ChevronRight className="size-5" />
              )}
            </span>
            <div>
              <div className="text-xs text-secondary-text">
                {t("purchase.fields.product")}
              </div>
              <div className="font-semibold text-text">{productName}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-secondary-text">
                {t("openingInventory.fields.quantity")}
              </div>
              <div>
                {numberSpacing(quantity, undefined, true)} {t("sale.fields.piece")}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-secondary-text">
                {t("sale.fields.status")}
              </div>
              <div className={isComplete ? "font-semibold text-success" : undefined}>
                {numberSpacing(markings.length, undefined, true)} / {numberSpacing(quantity, undefined, true)}
                {isComplete && (
                  <CheckCircle2 className="ml-1 inline-block size-4 text-success" />
                )}
              </div>
            </div>
          </button>

          {isProductExpanded && (
            <div className="space-y-2 p-2">
              {batches.map((batch) => {
                const rows = batchRows(batch);
                const isBatchExpanded = expandedBatches[batch.batchId] ?? false;
                const isBatchComplete =
                  batch.selectedQuantity === Math.round(batch.quantity);

                return (
                  <div
                    key={batch.batchId}
                    className={`overflow-hidden rounded-md border ${
                      isBatchComplete
                        ? "border-success/50 bg-success-soft/40"
                        : "border-border bg-card"
                    }`}
                  >
                    <button
                      type="button"
                      className={`flex w-full flex-wrap items-center justify-between gap-3 border-b px-3 py-2 text-left ${
                        isBatchComplete
                          ? "border-success/40 bg-success-soft/70"
                          : "border-border bg-surface-muted"
                      }`}
                      aria-expanded={isBatchExpanded}
                      onClick={() =>
                        setExpandedBatches((current) => ({
                          ...current,
                          [batch.batchId]: !isBatchExpanded,
                        }))
                      }
                    >
                      <span className="flex items-center gap-2">
                        {isBatchExpanded ? (
                          <ChevronDown className="size-4 text-secondary-text" />
                        ) : (
                          <ChevronRight className="size-4 text-secondary-text" />
                        )}
                        <span>
                          <span className="block text-sm font-semibold text-text">
                            {t("sale.fields.batch")} {batch.batchNumber}
                          </span>
                          <span className="block text-xs text-secondary-text">
                            {t("warehouse.fields.documentNumber")}: {batch.documentNumber || batch.documentId || "-"}
                            {batch.batchDate
                              ? ` · ${t("sale.fields.receiptDate")}: ${customDate(batch.batchDate)}`
                              : ""}
                          </span>
                        </span>
                      </span>
                      <span className="text-right text-sm text-secondary-text">
                        <span className="block">
                          {t("openingInventory.fields.quantity")}: {numberSpacing(batch.quantity, undefined, true)} {t("sale.fields.piece")}
                        </span>
                        <span className={isBatchComplete ? "font-medium text-success" : "font-medium text-text"}>
                          {t("sale.fields.marked")}: {numberSpacing(batch.selectedQuantity, undefined, true)} / {numberSpacing(batch.quantity, undefined, true)}
                        </span>
                      </span>
                    </button>
                    {isBatchExpanded && (
                      <Table<MarkingRow>
                        size="small"
                        columns={columns}
                        dataSource={rows}
                        pagination={false}
                        scroll={{ x: "max-content" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}
