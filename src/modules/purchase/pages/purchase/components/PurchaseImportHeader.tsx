import { Col, Row } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormikProps } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import SelectDate from "@/components/fields/SelectDate";
import SelectCustom from "@/components/fields/SelectCustom";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import Card from "@/components/ui/card/Card";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import type { PurchaseImportForm } from "../types/form";
import type { PurchaseMode } from "../types/type";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import { purchaseDocumentTypeIds } from "../constants/endpoints";

interface PurchaseImportHeaderProps {
  formik: FormikProps<PurchaseImportForm>;
  purchaseMode: PurchaseMode;
}

export default function PurchaseImportHeader({
  formik,
  purchaseMode,
}: PurchaseImportHeaderProps) {
  const { t } = useTranslation();
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const hasCounterparty = Boolean(formik.values.counterpartyId);

  const clearContract = () => {
    if (formik.values.contractId !== null) {
      formik.setFieldValue("contractId", null, false);
    }
  };

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
      {/* <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {t("Purchase.excelImport.title")}
        </h2>
        <div className="flex items-center gap-2">
          <Button type="text" onClick={onBack}>
            <ArrowLeft className="size-4" />
            {t("Buttons.back")}
          </Button>
        </div>
      </div> */}
      <div className="mt-1">
        <Row gutter={24}>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectDate
              label="purchase.fields.docDate"
              formik={formik}
              fieldName="docDate"
              onChange={clearContract}
            />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <CounterpartySelect
              kind="supplier"
              fieldName="counterpartyId"
              label={
                purchaseMode === "services"
                  ? t("purchase.fields.executor")
                  : t("purchase.fields.supplier")
              }
              formik={formik}
              onChange={clearContract}
              addOption={{
                bool: true,
                permissionCode: counterpartyPermissions.create,
                onClick: () => {
                  setCounterpartyCreateOpen(true);
                },
              }}
              required
            />
          </Col>
          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={selectListEndpoints.contractsSelectList}
              queryParams={{
                choosedDate: dayjs(formik.values.docDate).format(
                  formatDateWithOutTime,
                ),
                [filterIds.counterparty]: formik.values.counterpartyId,
              }}
              enabled={hasCounterparty}
              disabled={!hasCounterparty}
              label="purchase.fields.contract"
              fieldName="contractId"
              formik={formik}
              getFirst
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
              path={selectListEndpoints.warehousesSelectList}
              label="purchase.fields.warehouse"
              fieldName="warehouseId"
              formik={formik}
              required
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
            <DocumentAccountSelect
              fieldName="supplierAccountId"
              label="purchase.fields.supplierAccount"
              documentTypeId={purchaseDocumentTypeIds[purchaseMode]}
              documentRoleCode="supplier_settlement"
              formik={formik}
              getFirst
              search
              required
            />
          </Col>
        </Row>
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
