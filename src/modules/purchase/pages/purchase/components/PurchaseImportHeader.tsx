import { Button, Col, Row, Segmented } from "antd";
import dayjs from "dayjs";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { FormikProps } from "formik";
import { ArrowLeft, Plus } from "lucide-react";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import ExcelImportFile from "@/components/widget/excelimport/ExcelImportFile";
import {
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import type { PurchaseImportForm } from "../types/form";
import type {
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
} from "../types/type";

interface PurchaseImportHeaderProps {
  formik: FormikProps<PurchaseImportForm>;
  hasSelectedRows: boolean;
  onAddManualRow: () => void;
  onBack: () => void;
  onExcelDataChange: Dispatch<SetStateAction<PurchaseImportRow[]>>;
  onPurchaseModeChange: (value: PurchaseMode) => void;
  purchaseMode: PurchaseMode;
  selectBoxOptions: SelectBoxOptions[];
  setSelectBoxOptions: Dispatch<SetStateAction<SelectBoxOptions[]>>;
}

export default function PurchaseImportHeader({
  formik,
  hasSelectedRows,
  onAddManualRow,
  onBack,
  onExcelDataChange,
  onPurchaseModeChange,
  purchaseMode,
  selectBoxOptions,
  setSelectBoxOptions,
}: PurchaseImportHeaderProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {t("Purchase.excelImport.title")}
        </h2>
        <div className="flex items-center gap-2">
          <Button type="text" onClick={onBack}>
            <ArrowLeft className="size-4" />
            {t("Buttons.back")}
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <Row gutter={20}>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectDate label="Sana" formik={formik} fieldName="docDate" />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              fieldName="counterpartyId"
              label={
                purchaseMode === "services" ? "Ijrochi" : "Yetkazib beruvchi"
              }
              path={selectListEndpoints.counterpartiesSelectList}
              getFirst
              formik={formik}
            />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={selectListEndpoints.warehousesSelectList}
              label="Ombor"
              fieldName="warehouseId"
              formik={formik}
            />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={selectListEndpoints.currenciesSelectList}
              label="Valyuta"
              fieldName="currencyId"
              formik={formik}
            />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={
                selectListEndpoints.contractsSelectList +
                `?choosedDate=${dayjs(formik.values.docDate).format(formatDateWithOutTime)}${formik.values.counterpartyId ? `&${filterIds.counterparty}=${formik.values.counterpartyId}` : ""}`
              }
              label="Shartnoma"
              fieldName="contractId"
              formik={formik}
              required
              refetchSync={`${formik.values.counterpartyId}${formik.values.docDate}`}
            />
          </Col>
        </Row>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            disabled={hasSelectedRows}
            value={purchaseMode}
            onChange={(value) => onPurchaseModeChange(value as PurchaseMode)}
            options={[
              { label: "Prixod tovar", value: "goods" },
              { label: "Prixod uslug", value: "services" },
            ]}
          />
          <ExcelImportFile
            variant="button"
            selectBoxOptions={selectBoxOptions}
            setSelectBoxOptions={setSelectBoxOptions}
            setData={onExcelDataChange}
            formik={formik}
            disabled={!formik.values.counterpartyId}
          />
          <Button
            type="default"
            htmlType="button"
            icon={<Plus className="size-4" />}
            disabled={!formik.values.counterpartyId}
            onClick={onAddManualRow}
          >
            {purchaseMode === "services" ? "Xizmat qo'shish" : "Tovar qo'shish"}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button htmlType="button" onClick={onBack}>
            Bekor qilish
          </Button>
          <Button type="primary" loading={formik.isSubmitting} htmlType="submit">
            {t("common.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
