import { Button, Table, Tooltip, type TableColumnType } from "antd";
import { PackagePlus, Plus } from "lucide-react";
import PurchaseImportSummary from "./PurchaseImportSummary";
import type { PurchaseImportRow, PurchaseMode } from "../types/type";

interface PurchaseImportLinesSectionProps {
  columns: TableColumnType<PurchaseImportRow>[];
  comment: string;
  counterpartyId: number | null;
  foundedSapCodes: number;
  height: number;
  isFetching: boolean;
  isLoading: boolean;
  lines: PurchaseImportRow[];
  onAddManualRow: () => void;
  onCommentChange: (value: string) => void;
  onDeleteSapCodes: () => void;
  onOpenMissingProductsModal: () => void;
  purchaseMode: PurchaseMode;
  totals: {
    amount: number;
    vatAmount: number;
    totalAmount: number;
  };
}

export default function PurchaseImportLinesSection({
  columns,
  comment,
  counterpartyId,
  foundedSapCodes,
  height,
  isFetching,
  isLoading,
  lines,
  onAddManualRow,
  onCommentChange,
  onDeleteSapCodes,
  onOpenMissingProductsModal,
  purchaseMode,
  totals,
}: PurchaseImportLinesSectionProps) {
  const loading = isLoading || isFetching;

  return (
    <>
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-end gap-3">
          {lines.length > 0 && purchaseMode === "goods" && (
            <>
              <Button
                type="default"
                htmlType="button"
                onClick={onOpenMissingProductsModal}
                icon={<PackagePlus className="size-4" />}
                disabled={loading || foundedSapCodes === 0}
              >
                Topilmagan SAP kodlarni belgilash ({foundedSapCodes})
              </Button>
              <Button
                type="primary"
                htmlType="button"
                danger
                onClick={onDeleteSapCodes}
                icon={<div>{foundedSapCodes}</div>}
                disabled={loading || foundedSapCodes === 0}
              >
                Topilmagan SAP kodlarni o'chirish
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg relative">
        <Table
          className="sm={12} lg={8} xl={4} [&_.ant-table-tbody>tr>td]:py-3! "
          loading={loading}
          columns={columns}
          dataSource={lines.map((item, index) => ({
            ...item,
            indexId: index + 1,
            key: index + 1,
          }))}
          virtual
          scroll={{ y: height - 320, x: "max-content" }}
          pagination={false}
        />
        <PurchaseImportSummary
          comment={comment}
          totals={totals}
          onCommentChange={onCommentChange}
        />
        <div className="sticky bottom-0 z-10 flex justify-center border-t border-border bg-primary-bg/95 py-2 backdrop-blur">
          <Tooltip title="Qator qo'shish">
            <Button
              type="primary"
              htmlType="button"
              shape="circle"
              size="large"
              className="shadow-md"
              icon={<Plus className="size-5" />}
              disabled={!counterpartyId}
              onClick={onAddManualRow}
            />
          </Tooltip>
        </div>
      </div>
    </>
  );
}
