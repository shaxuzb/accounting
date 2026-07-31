import { Button, Segmented } from "antd";
import { Plus } from "lucide-react";
import type { FormikProps } from "formik";
import type { OpeningInventoryForm } from "../types/form";
import type { OpeningInventoryMode } from "../types/type";

export interface OpeningInventoryActionsProps {
  formik: FormikProps<OpeningInventoryForm>;
  mode: OpeningInventoryMode;
  modeDisabled: boolean;
  onModeChange: (mode: OpeningInventoryMode) => void;
  onAddManualRow: () => void;
  onBack: () => void;
  onSave?: () => void;
  saveLoading?: boolean;
}

export default function OpeningInventoryActions({
  formik,
  mode,
  modeDisabled,
  onModeChange,
  onAddManualRow,
  onBack,
  onSave,
  saveLoading,
}: OpeningInventoryActionsProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          disabled={modeDisabled}
          value={mode}
          onChange={(value) => onModeChange(value as OpeningInventoryMode)}
          options={[
            { label: "Kirim tovar", value: "goods" },
            { label: "Kirim xizmat", value: "services" },
          ]}
        />
        <Button
          type="default"
          htmlType="button"
          icon={<Plus className="size-4" />}
          disabled={!formik.values.counterpartyId}
          onClick={onAddManualRow}
        >
          {mode === "services" ? "Xizmat qo'shish" : "Tovar qo'shish"}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button htmlType="button" onClick={onBack}>
          Bekor qilish
        </Button>
        <Button
          type="primary"
          loading={saveLoading ?? formik.isSubmitting}
          htmlType={onSave ? "button" : "submit"}
          onClick={onSave}
        >
          Saqlash
        </Button>
      </div>
    </div>
  );
}
