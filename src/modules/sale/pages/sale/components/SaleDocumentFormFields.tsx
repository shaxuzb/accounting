import { useEffect, useRef, useState } from "react";
import { usePriceTypes } from "@/modules/priceType/api";
import { contractTypeIds, takeMainOrOnlyContract } from "@/shared/constants/contractSelect";
import { useContractPriceIncludesVatDefault } from "@/shared/hooks/useContractDefaults";
import type { FormikProps } from "formik";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import InputText from "@/components/fields/InputText";
import SettlementDocumentSelect from "@/components/fields/SettlementDocumentSelect";
import InputNumberFormat from "@/components/fields/InputNumber";
import { useAutoExchangeRate } from "@/modules/accountings/pages/currency/useAutoExchangeRate";
import CounterpartySelect from "@/components/fields/CounterpartySelect";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import type { SaleDocForm } from "../types/form";
import { Col, Form, Row, Select } from "antd";
import Card from "@/components/ui/card/Card";
import {
  saleDocumentAccountRoleCodes,
  saleDocumentTypeId,
} from "../constants/documentAccount";
import { useTranslation } from "react-i18next";

interface Props {
  formik: FormikProps<SaleDocForm>;
  isEdit: boolean;
  /** A non-payer posts no output VAT, so it needs no VAT account (1C «Без НДС»). */
  vatPayer?: boolean;
  /** The price type changed (by hand or with the contract): the lines' prices may be refilled. */
  onPriceTypeChanged?: (name: string) => void;
}

export default function SaleDocumentFormFields({
  formik,
  isEdit,
  vatPayer = true,
  onPriceTypeChanged,
}: Props) {
  const rate = useAutoExchangeRate(formik);
  // 1C «Валюта взаиморасчетов»: a contract that names its currency puts it on the sale and fixes it
  const { contractCurrencyId, contractPriceTypeId } = useContractPriceIncludesVatDefault(formik, true);
  const { data: priceTypes = [] } = usePriceTypes();
  const defaultPriceTypeId = priceTypes.find((type) => type.isDefault)?.id ?? null;

  const changePriceType = (priceTypeId: number | null) => {
    if ((formik.values.priceTypeId ?? null) === priceTypeId) return;
    formik.setFieldValue("priceTypeId", priceTypeId, false);
    const type = priceTypes.find((item) => item.id === priceTypeId);
    if (type) onPriceTypeChanged?.(type.name);
  };

  // 1C: the contract's price type, else the default one, comes onto the sale when the contract
  // is picked; a loaded document keeps the type it was saved with
  const initialValuesRef = useRef(formik.initialValues);
  const appliedContractRef = useRef<number | null | undefined>(formik.values.contractId);
  useEffect(() => {
    if (initialValuesRef.current !== formik.initialValues) {
      initialValuesRef.current = formik.initialValues;
      appliedContractRef.current = formik.values.contractId;
      return;
    }
    if (priceTypes.length === 0) return;
    const contractId = formik.values.contractId ?? null;
    if (formik.values.priceTypeId === undefined && !contractId) {
      formik.setFieldValue("priceTypeId", defaultPriceTypeId, false);
      appliedContractRef.current = contractId;
      return;
    }
    if (appliedContractRef.current === contractId) return;
    if (contractId && contractPriceTypeId === undefined) return; // the contract is loading
    appliedContractRef.current = contractId;
    // a contract without a type keeps the one chosen on the sale
    changePriceType(contractPriceTypeId ?? formik.values.priceTypeId ?? defaultPriceTypeId);
    // formik is a new object every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.initialValues, formik.values.contractId, formik.values.priceTypeId, contractPriceTypeId, priceTypes, defaultPriceTypeId]);
  const { t } = useTranslation();
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const clearContract = () => {
    if (formik.values.contractId !== null) {
      formik.setFieldValue("contractId", null, false);
    }
    // another customer's (or contract's) advance is no advance of this sale
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
    // <div className="grid gap-x-3 border-b border-border pb-1 sm:grid-cols-2 xl:grid-cols-4">
    <Card className="p-3">
      <Row gutter={[16, 0]}>
        <Col span={4}>
          <SelectDate
            label={t("bank.fields.date")}
            fieldName="docDate"
            formik={formik}
            onChange={clearContract}
            required
          />
        </Col>
        <Col span={4}>
          <CounterpartySelect
            kind="client"
            label={t("sale.fields.customer")}
            fieldName="counterpartyId"
            formik={formik}
            onChange={clearContract}
            required
            addOption={{
              bool: true,
              permissionCode: counterpartyPermissions.create,
              onClick: () => {
                setCounterpartyCreateOpen(true);
              },
            }}
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            path={selectListEndpoints.contractsSelectList}
            queryParams={{
              choosedDate: dayjs(formik.values.docDate).format(
                formatDateWithOutTime,
              ),
              [filterIds.counterparty]: formik.values.counterpartyId,
              // a sale is entered under a contract with a customer (1C «Вид договора»)
              [filterIds.contractType]: contractTypeIds.customer,
            }}
            label={t("purchase.fields.contract")}
            fieldName="contractId"
            formik={formik}
            getFirstWhen={takeMainOrOnlyContract}
            enabled={Boolean(formik.values.counterpartyId)}
            disabled={!formik.values.counterpartyId}
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
        <Col span={4}>
          <SelectCustom
            label={t("menu.warehouse")}
            fieldName="warehouseId"
            path={selectListEndpoints.warehousesSelectList} createWith="warehouse"
            formik={formik}
            required
            // the lines' stock and batches belong to this warehouse
            disabled={isEdit}
          />
        </Col>
        <Col span={4}>
          <DocumentAccountSelect
            label={t("sale.fields.customerAccount")}
            fieldName="customerAccountId"
            formik={formik}
            search
            required
            documentTypeId={saleDocumentTypeId}
            documentRoleCode={saleDocumentAccountRoleCodes.customerSettlement}
            getFirst
          />
        </Col>
        {vatPayer && (
          <Col span={4}>
            <DocumentAccountSelect
              label={t("sale.fields.vatAccount")}
              fieldName="vatAccountId"
              formik={formik}
              search
              required
              documentTypeId={saleDocumentTypeId}
              documentRoleCode={saleDocumentAccountRoleCodes.vat}
              getFirst
            />
          </Col>
        )}
        <Col span={24} sm={12} lg={8} xl={4}>
          <SelectCustom
            label={t("app.fields.currency")}
            fieldName="currencyId"
            path={selectListEndpoints.currenciesSelectList}
            formik={formik}
            getFirst
            required
            disabled={Boolean(contractCurrencyId)}
          />
        </Col>
        {priceTypes.length > 0 && (
          <Col span={24} sm={12} lg={8} xl={4}>
            <Form.Item label={t("priceType.salePriceType")} className="mb-2">
              <Select
                allowClear
                className="w-full"
                value={formik.values.priceTypeId ?? null}
                placeholder={t("priceType.saleNoType")}
                // as the other selects of the form (SelectCustom): no filled background
                style={{ backgroundColor: "transparent" }}
                onChange={(value?: number) => changePriceType(value ?? null)}
                options={priceTypes.map((type) => ({ value: type.id, label: type.name }))}
              />
            </Form.Item>
          </Col>
        )}
        {rate.isForeign && (
          <Col span={24} sm={12} lg={8} xl={4}>
            <InputNumberFormat
              formik={formik}
              fieldName="exchangeRate"
              label="currency.rate"
              min={0}
              precision={6}
            />
          </Col>
        )}
        <SettlementDocumentSelect
          formik={formik}
          kind="advance"
          colSpan={4}
          counterpartyId={formik.values.counterpartyId}
          contractId={formik.values.contractId}
          directionId={1}
          currencyId={Number(formik.values.currencyId) || null}
          date={formik.values.docDate}
        />
        {/* the buyer's agent's power (1C «Доверенность покупателя»): the ESF's empowerment */}
        <Col span={24}>
          <div className="mb-2 text-sm font-medium text-secondary-text">{t("sale.buyerPower.title")}</div>
        </Col>
        <Col span={24} sm={12} lg={6} xl={4}>
          <InputText formik={formik} fieldName="buyerEmpowermentNumber" label="sale.buyerPower.number" />
        </Col>
        <Col span={24} sm={12} lg={6} xl={4}>
          <SelectDate formik={formik} fieldName="buyerEmpowermentDate" label={t("sale.buyerPower.date")} valueFormat="YYYY-MM-DD" />
        </Col>
        <Col span={24} sm={12} lg={6} xl={8}>
          <InputText formik={formik} fieldName="buyerAgentName" label="sale.buyerPower.agent" />
        </Col>
        <Col span={24} sm={12} lg={6} xl={4}>
          <InputText formik={formik} fieldName="buyerAgentPinfl" label="sale.buyerPower.pinfl" />
        </Col>
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
          contractTypeId={2}
          initialCounterpartyId={formik.values.counterpartyId}
        initialContractDate={formik.values.docDate ? dayjs(formik.values.docDate).format(formatDate) : undefined}
          onCreated={handleContractCreated}
          onClose={() => {
            setContractCreateOpen(false);
          }}
        />
      </Row>
    </Card>
    // </div>
  );
}
