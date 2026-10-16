import { useVatPayer } from "@/shared/hooks/useVatPayer";
import { contractTypeIds, takeMainOrOnlyContract } from "@/shared/constants/contractSelect";
import { Alert, Col, Row } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FormikProps } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import SelectDate from "@/components/fields/SelectDate";
import SettlementDocumentSelect from "@/components/fields/SettlementDocumentSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import InputNumberFormat from "@/components/fields/InputNumber";
import { useAutoExchangeRate } from "@/modules/accountings/pages/currency/useAutoExchangeRate";
import SwitchField from "@/components/fields/SwitchField";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import Card from "@/components/ui/card/Card";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import type { PurchaseImportForm } from "../types/form";
import type { PurchaseMode } from "../types/type";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import { purchaseDocumentTypeIds } from "../constants/endpoints";
import { useContractPriceIncludesVatDefault } from "../hooks/useContractPriceIncludesVatDefault";

interface PurchaseImportHeaderProps {
  formik: FormikProps<PurchaseImportForm>;
  purchaseMode: PurchaseMode;
  readOnlyDate?: boolean;
  showCurrency?: boolean;
  /** The rate a purchase in another currency is posted at; off where it is not saved. */
  showExchangeRate?: boolean;
  showSupplierAccount?: boolean;
  allowCreateOptions?: boolean;
  /** EDO import takes the invoice's own amounts, so the switch means nothing there. */
  showPriceIncludesVat?: boolean;
  disabled?: boolean;
}

export default function PurchaseImportHeader({
  formik,
  purchaseMode,
  readOnlyDate = false,
  showCurrency = true,
  showExchangeRate = true,
  showSupplierAccount = true,
  allowCreateOptions = true,
  showPriceIncludesVat = true,
  disabled = false,
}: PurchaseImportHeaderProps) {
  const { t } = useTranslation();
  const vatPayer = useVatPayer(formik.values.docDate);
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const hasCounterparty = Boolean(formik.values.counterpartyId);
  // the contract brings its «Narx QQS bilan» and its settlement currency (1C)
  const { contractCurrencyId } = useContractPriceIncludesVatDefault(
    formik,
    showPriceIncludesVat && !disabled,
  );
  // a purchase in another currency is posted at this rate (CBU on the date, editable)
  const rate = useAutoExchangeRate(formik);

  const clearContract = () => {
    if (formik.values.contractId !== null) {
      formik.setFieldValue("contractId", null, false);
    }
    // another supplier's (or contract's) advance is no advance of this purchase
    if (formik.values.advanceDocumentId) {
      formik.setFieldValue("advanceDocumentId", null, false);
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
              readOnly={readOnlyDate || disabled}
              disabled={readOnlyDate || disabled}
              onChange={readOnlyDate || disabled ? undefined : clearContract}
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
              disabled={disabled}
              onChange={disabled ? undefined : clearContract}
              addOption={{
                bool: allowCreateOptions,
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
                // a purchase is entered under a contract with a supplier (1C «Вид договора»)
                [filterIds.contractType]: contractTypeIds.supplier,
              }}
              enabled={hasCounterparty}
              disabled={!hasCounterparty || disabled}
              label="purchase.fields.contract"
              fieldName="contractId"
              formik={formik}
              getFirstWhen={allowCreateOptions ? takeMainOrOnlyContract : undefined}
              required
              addOption={{
                bool: allowCreateOptions,
                permissionCode: contractPermissions.create,
                onClick: () => {
                  setContractCreateOpen(true);
                },
              }}
            />
          </Col>

          <Col span={24} sm={12} lg={8} xl={4}>
            <SelectCustom
              path={selectListEndpoints.warehousesSelectList} createWith="warehouse"
              label="purchase.fields.warehouse"
              fieldName="warehouseId"
              formik={formik}
              disabled={disabled}
              required
            />
          </Col>
          {showCurrency ? (
            <Col span={24} sm={12} lg={8} xl={4}>
              <SelectCustom
                path={selectListEndpoints.currenciesSelectList}
                label="purchase.fields.currency"
                fieldName="currencyId"
                formik={formik}
                // a contract with a settlement currency fixes it, as in 1C
                disabled={disabled || Boolean(contractCurrencyId)}
                getFirst={allowCreateOptions}
                required
              />
            </Col>
          ) : null}
          {showExchangeRate && rate.isForeign ? (
            <Col span={24} sm={12} lg={8} xl={4}>
              <InputNumberFormat
                formik={formik}
                fieldName="exchangeRate"
                label="currency.rate"
                min={0}
                precision={6}
                disabled={disabled}
              />
            </Col>
          ) : null}

          {showSupplierAccount ? (
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
          ) : null}
          {showSupplierAccount && (
            <SettlementDocumentSelect
              formik={formik}
              kind="advance"
              colSpan={4}
              counterpartyId={formik.values.counterpartyId}
              contractId={formik.values.contractId}
              directionId={-1}
              currencyId={Number(formik.values.currencyId) || null}
              date={formik.values.docDate}
              disabled={disabled}
            />
          )}

          {/* Whether the typed prices already contain VAT. Invoices come both ways:
              with it, the VAT is taken out of the amount; without it, it is added on
              top. Stock is valued at the net either way. */}
          {showPriceIncludesVat && (
            <Col span={24} sm={12} lg={8} xl={4}>
              <SwitchField
                formik={formik}
                fieldName="priceIncludesVat"
                label="purchase.fields.priceIncludesVat"
                description={
                  formik.values.priceIncludesVat
                    ? "purchase.messages.priceIncludesVatOn"
                    : "purchase.messages.priceIncludesVatOff"
                }
                disabled={disabled}
                marginBottom="mb-4"
              />
            </Col>
          )}
        </Row>
        {!vatPayer.isVatPayer && (
          <Alert
            type="info"
            showIcon
            className="mt-1"
            message={t("purchase.messages.nonVatPayerHint")}
          />
        )}
      </div>
      <CounterpartyAddEditPage
        open={counterpartyCreateOpen}
        onClose={() => {
          setCounterpartyCreateOpen(false);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyId",
            selectListEndpoints.counterpartiesSelectList,
          );
        }}
      />
      <ContractAddEditPage
        open={contractCreateOpen}
        contractTypeId={1}
        initialCounterpartyId={formik.values.counterpartyId}
        initialContractDate={formik.values.docDate ? dayjs(formik.values.docDate).format(formatDate) : undefined}
        onCreated={handleContractCreated}
        onClose={() => {
          setContractCreateOpen(false);
        }}
      />
    </Card>
  );
}
