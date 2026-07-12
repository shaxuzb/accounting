import { Button, Col, Row, Segmented } from "antd";
import dayjs from "dayjs";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { FormikProps } from "formik";
import { ArrowLeft, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import Card from "@/components/ui/card/Card";
import ExcelImportFile from "@/components/widget/excelimport/ExcelImportFile";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import type { PurchaseImportForm } from "../types/form";
import type {
  PurchaseImportRow,
  PurchaseMode,
  SelectBoxOptions,
} from "../types/type";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";

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
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleContractCreated = (contract: Contract) => {
    formik.setFieldValue("contractId", contract.id, true);
    invalidateSelectListQuery(
      queryClient,
      "contractId",
      selectListEndpoints.contractsSelectList,
    );
  };

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
        <Row gutter={24}>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectDate label="Sana" formik={formik} fieldName="docDate" />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              fieldName="counterpartyId"
              label={
                purchaseMode === "services" ? "Ijrochi" : "Yetkazib beruvchi"
              }
              path={selectListEndpoints.suppliersSelectList}
              getFirst
              formik={formik}
              addOption={{
                bool: true,
                permissionCode: counterpartyPermissions.create,
                onClick: () => {
                  setCounterpartyCreateOpen(true);
                },
              }}
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
          {/* <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={selectListEndpoints.currenciesSelectList}
              label="Valyuta"
              fieldName="currencyId"
              formik={formik}
              getFirst={true}
            />
          </Col> */}
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={selectListEndpoints.contractsSelectList}
              queryParams={{
                choosedDate: dayjs(formik.values.docDate).format(
                  formatDateWithOutTime,
                ),
                [filterIds.counterparty]: formik.values.counterpartyId,
              }}
              disabled={!formik.values.counterpartyId}
              label="Shartnoma"
              fieldName="contractId"
              formik={formik}
              required
              addOption={{
                bool: true,
                permissionCode: contractPermissions.create,
                onClick: () => {
                  setContractCreateOpen(true);
                },
              }}
            />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              fieldName="supplierAccountId"
              label="Yetkazib beruvchi schyoti"
              path={selectListEndpoints.chartAccountsSelectList}
              formik={formik}
              search
              required
              optionLabel={chartAccountOptionLabel}
              selectedLabel={chartAccountSelectedLabel}
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
          <Button
            type="primary"
            loading={formik.isSubmitting}
            htmlType="submit"
          >
            {t("common.save")}
          </Button>
        </div>
      </div>
      <CounterpartyAddEditPage
        open={counterpartyCreateOpen}
        onClose={() => {
          setCounterpartyCreateOpen(false);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyId",
            selectListEndpoints.suppliersSelectList,
          );
        }}
      />
      <ContractAddEditPage
        open={contractCreateOpen}
        contractTypeId={1}
        initialCounterpartyId={formik.values.counterpartyId}
        onCreated={handleContractCreated}
        onClose={() => {
          setContractCreateOpen(false);
        }}
      />
    </Card>
  );
}
