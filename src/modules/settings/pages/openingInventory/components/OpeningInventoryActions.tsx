import { Button, Segmented } from "antd";
import { Plus } from "lucide-react";
import type { FormikProps } from "formik";
import type { OpeningInventoryForm } from "../types/form";
import type { OpeningInventoryMode } from "../types/type";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          disabled={modeDisabled}
          value={mode}
          onChange={(value) => onModeChange(value as OpeningInventoryMode)}
          options={[
            { label: t("openingInventory.modes.goodsReceipt"), value: "goods" },
            { label: t("openingInventory.modes.serviceReceipt"), value: "services" },
          ]}
        />
        <Button
          type="default"
          htmlType="button"
          icon={<Plus className="size-4" />}
          disabled={!formik.values.counterpartyId}
          onClick={onAddManualRow}
        >
          {mode === "services"
            ? t("openingInventory.actions.addService")
            : t("openingInventory.actions.addGoods")}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button htmlType="button" onClick={onBack}>
          {t("common.cancel")}
        </Button>
        <Button
          type="primary"
          loading={saveLoading ?? formik.isSubmitting}
          htmlType={onSave ? "button" : "submit"}
          onClick={onSave}
        >
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
