import { Button, Table, Tooltip, type TableColumnType } from "antd";
import { Plus } from "lucide-react";
import Card from "@/components/ui/card/Card";
import OpeningInventorySummary from "./OpeningInventorySummary";
import OpeningInventoryActions, {
  type OpeningInventoryActionsProps,
} from "./OpeningInventoryActions";
import type { OpeningInventoryMode, OpeningInventoryRow } from "../types/type";
import { useTranslation } from "react-i18next";

interface OpeningInventoryLinesSectionProps extends OpeningInventoryActionsProps {
  columns: TableColumnType<OpeningInventoryRow>[];
  comment: string;
  height: number;
  isFetching: boolean;
  isLoading: boolean;
  lines: OpeningInventoryRow[];
  onCommentChange: (value: string) => void;
  mode: OpeningInventoryMode;
  modeDisabled: boolean;
  onModeChange: (mode: OpeningInventoryMode) => void;
  totals: {
    amount: number;
    vatAmount: number;
    totalAmount: number;
  };
}

export default function OpeningInventoryLinesSection({
  columns,
  comment,
  isFetching,
  isLoading,
  lines,
  formik,
  onAddManualRow,
  onBack,
  onSave,
  saveLoading,
  onCommentChange,
  mode,
  modeDisabled,
  onModeChange,
  totals,
  height,
}: OpeningInventoryLinesSectionProps) {
  const { t } = useTranslation();
  const loading = isLoading || isFetching;
  const tableHeight = Math.max(240, height - 320);

  return (
    <Card className="mt-1 overflow-hidden border border-border">
      <div className="border-b border-border p-3">
        <OpeningInventoryActions
          formik={formik}
          mode={mode}
          modeDisabled={modeDisabled}
          onModeChange={onModeChange}
          onAddManualRow={onAddManualRow}
          onBack={onBack}
          onSave={onSave}
          saveLoading={saveLoading}
        />
      </div>

      <div className="rounded-lg relative">
        <Table
          loading={loading}
          columns={columns}
          dataSource={lines}
          rowKey="key"
          scroll={{ y: tableHeight, x: "max-content" }}
          pagination={false}
        />
        <OpeningInventorySummary
          comment={comment}
          totals={totals}
          onCommentChange={onCommentChange}
        />
        <div className="sticky bottom-0 z-10 flex justify-center border-t border-border bg-primary-bg/95 py-2 backdrop-blur">
          <Tooltip title={t("openingInventory.actions.addLine")}>
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
