import { Button, Segmented } from "antd";
import { Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { FormikProps } from "formik";
import { useTranslation } from "react-i18next";
import ExcelImportFile from "@/components/widget/excelimport/ExcelImportFile";
import type {
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
} from "../types/type";
import type { PurchaseImportForm } from "../types/form";

export interface PurchaseImportActionsProps {
  formik: FormikProps<PurchaseImportForm>;
  hasSelectedRows: boolean;
  onAddManualRow: () => void;
  onBack: () => void;
  onSave?: () => void;
  saveLoading?: boolean;
  onExcelDataChange: Dispatch<SetStateAction<PurchaseImportRow[]>>;
  onClearExcelData: () => void;
  onPurchaseModeChange: (value: PurchaseMode) => void;
  purchaseMode: PurchaseMode;
  selectBoxOptions: SelectBoxOptions[];
  setSelectBoxOptions: Dispatch<SetStateAction<SelectBoxOptions[]>>;
}

export default function PurchaseImportActions({
  formik,
  hasSelectedRows,
  onAddManualRow,
  onBack,
  onSave,
  saveLoading,
  onExcelDataChange,
  onClearExcelData,
  onPurchaseModeChange,
  purchaseMode,
  selectBoxOptions,
  setSelectBoxOptions,
}: PurchaseImportActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          disabled={hasSelectedRows}
          value={purchaseMode}
          onChange={(value) => onPurchaseModeChange(value as PurchaseMode)}
          options={[
            { label: t("purchase.actions.goodsReceipt"), value: "goods" },
            { label: t("purchase.actions.serviceReceipt"), value: "services" },
          ]}
        />
        <ExcelImportFile
          variant="button"
          selectBoxOptions={selectBoxOptions}
          setSelectBoxOptions={setSelectBoxOptions}
          setData={onExcelDataChange}
          onClearData={onClearExcelData}
          formik={formik}
        />
        <Button
          type="default"
          htmlType="button"
          icon={<Plus className="size-4" />}
          disabled={!formik.values.counterpartyId}
          onClick={onAddManualRow}
        >
          {t(
            purchaseMode === "services"
              ? "purchase.actions.addService"
              : "purchase.actions.addProduct",
          )}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button htmlType="button" onClick={onBack}>
          {t("common.cancel")}</Button>
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
