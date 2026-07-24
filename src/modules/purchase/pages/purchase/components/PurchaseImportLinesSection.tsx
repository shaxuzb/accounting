import { Button, Table, Tooltip, type TableColumnType } from "antd";
import { Plus } from "lucide-react";
import Card from "@/components/ui/card/Card";
import PurchaseImportSummary from "./PurchaseImportSummary";
import PurchaseImportActions, {
  type PurchaseImportActionsProps,
} from "./PurchaseImportActions";
import type { PurchaseImportRow, PurchaseMode } from "../types/type";

interface PurchaseImportLinesSectionProps extends PurchaseImportActionsProps {
  columns: TableColumnType<PurchaseImportRow>[];
  comment: string;
  counterpartyId: number | null;
  height: number;
  isFetching: boolean;
  isLoading: boolean;
  lines: PurchaseImportRow[];
  onAddManualRow: () => void;
  onCommentChange: (value: string) => void;
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
  // counterpartyId,
  isFetching,
  isLoading,
  lines,
  formik,
  hasSelectedRows,
  onAddManualRow,
  onBack,
  onSave,
  saveLoading,
  onExcelDataChange,
  onClearExcelData,
  onPurchaseModeChange,
  onCommentChange,
  purchaseMode,
  selectBoxOptions,
  setSelectBoxOptions,
  totals,
  height,
}: PurchaseImportLinesSectionProps) {
  const loading = isLoading || isFetching;
  const tableHeight = Math.max(240, height - 320);

  return (
    <Card className="mt-1 overflow-hidden border border-border">
      <div className="border-b border-border p-3">
        <PurchaseImportActions
          formik={formik}
          hasSelectedRows={hasSelectedRows}
          onAddManualRow={onAddManualRow}
          onBack={onBack}
          onSave={onSave}
          saveLoading={saveLoading}
          onExcelDataChange={onExcelDataChange}
          onClearExcelData={onClearExcelData}
          onPurchaseModeChange={onPurchaseModeChange}
          purchaseMode={purchaseMode}
          selectBoxOptions={selectBoxOptions}
          setSelectBoxOptions={setSelectBoxOptions}
        />
      </div>

      <div className="rounded-lg relative">
        <Table
          // className="sm={12} lg={8} xl={4} [&_.ant-table-tbody>tr>td]:py-3! "
          loading={loading}
          columns={columns}
          dataSource={lines}
          rowKey="key"
          scroll={{ y: tableHeight, x: "max-content" }}
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
              onClick={onAddManualRow}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
