import type { FormikProps } from "formik";
import { useState } from "react";
import dayjs from "dayjs";
import { Col, Form, Input, Row } from "antd";
import { MoneyOperationKindSelect, useMoneyOperationKinds } from "@/shared/moneyOperationKinds";
import { useQueryClient } from "@tanstack/react-query";
import { useCashBoxCurrency } from "@/modules/cashoperation/hooks/useCashBoxCurrency";
import { useAccountKeptByEmployee } from "@/shared/hooks/useAccountKeptByEmployee";
import PayrollEmployeeSelect from "@/modules/payroll/components/PayrollEmployeeSelect";
import InputNumberFormat from "@/components/fields/InputNumber";
import DocumentAccountSelect from "@/components/fields/DocumentAccountSelect";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import SettlementDocumentSelect from "@/components/fields/SettlementDocumentSelect";
import MoneyOffsetAccountSelect from "@/shared/moneyOperationKinds/MoneyOffsetAccountSelect";
import MoneyDocumentAnalytics from "@/components/fields/MoneyDocumentAnalytics";
import InputText from "@/components/fields/InputText";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import { filterIds, selectListEndpoints } from "@/shared/constants/selectLists";
import { useContractSettlementAccount } from "@/shared/hooks/useContractSettlementAccount";
import { formatDate, formatDateWithOutTime } from "@/utils/helpers";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";
import {
  cashDocumentAccountRoleCodes,
  cashDocumentTypeIds,
} from "@/modules/cashoperation/constants/documentAccount";
import type { CashDocumentForm } from "../types/form";
import { useTranslation } from "react-i18next";
import { useMoneyCardAccount } from "@/shared/hooks/useMoneyCardAccount";

/** cmn_document_type: a cash operation (its entries are excluded from the debts it settles). */
const CASH_OPERATION_DOCUMENT_TYPE_ID = 4;

interface CashDocumentFormFieldsProps {
  formik: FormikProps<CashDocumentForm>;
  documentTypeId: number;
  /** The order being edited (its own settlement does not count against the debts). */
  documentId?: number | null;
}

export default function CashDocumentFormFields({
  formik,
  documentTypeId,
  documentId = null,
}: CashDocumentFormFieldsProps) {
  const { t } = useTranslation();
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const operationLabel =
    documentTypeId === cashDocumentTypeIds.expense
      ? "cash.fields.expense"
      : "cash.fields.income";
  const counterpartyId = Number(formik.values.counterpartyId) || null;
  const isExpense = documentTypeId === cashDocumentTypeIds.expense;
  // 1C «Передача в другую кассу»: an RKO to another cash box moves money between the boxes
  const isTransfer = isExpense && Boolean(formik.values.destinationCashBoxId);
  // the desks' own cash accounts (cash box card): the order's side and, to another desk, the receiving one
  useMoneyCardAccount(formik, "cashBoxId", "cashChartAccountId", selectListEndpoints.cashBoxesSelectList);
  useMoneyCardAccount(formik, "destinationCashBoxId", "offsetAccountId", selectListEndpoints.cashBoxesSelectList);
  const { data: kinds = [] } = useMoneyOperationKinds("cash", isExpense ? 2 : 1);
  const kind = kinds.find((item) => item.id === Number(formik.values.operationKindId));

  // As in 1C's ПКО/РКО: the contract decides the settlement account (4010 with a customer,
  // 6010 with a supplier) and, with settlements per contract, which debt the money closes.
  useContractSettlementAccount({
    formik,
    offsetFieldName: "offsetAccountId",
    documentTypeId,
    offsetRoleCode: cashDocumentAccountRoleCodes.offsetAccount,
    counterpartyId,
    contractId: Number(formik.values.contractId) || null,
    directionId: documentTypeId,
    docDate: formik.values.docDate,
    allowedPrefixes: kind?.offsetPrefixes,
  });

  useCashBoxCurrency(formik);
  // an advance to an accountable person (4220) and the like is kept by employee
  const offsetKeptByEmployee = useAccountKeptByEmployee(
    Number(formik.values.offsetAccountId) || null,
  );

  return (
    <>
      <Row gutter={[16, 0]}>
        <Col span={4}>
          {isTransfer ? (
            <Form.Item label={t("cash.fields.operationType")}>
              <Input value={t("moneyOperationKinds.transfer")} readOnly />
            </Form.Item>
          ) : (
            <MoneyOperationKindSelect
              channel="cash"
              direction={isExpense ? 2 : 1}
              value={formik.values.operationKindId}
              onChange={(next) => {
                formik.setFieldValue("operationKindId", next?.id ?? null, true);
                // 1C fills the account from the kind; the user may still change it
                if (next?.defaultOffsetAccount)
                  formik.setFieldValue("offsetAccountId", next.defaultOffsetAccount.id, true);
                if (next?.counterpartyMode === 0) {
                  formik.setFieldValue("counterpartyId", null, false);
                  formik.setFieldValue("contractId", null, false);
                }
              }}
            />
          )}
          <div className="-mt-4 mb-2 text-xs text-secondary-text">{t(operationLabel)}</div>
        </Col>

        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="cashBoxId"
            label="settings.entities.cashBox"
            path={selectListEndpoints.cashBoxesSelectList}
          />
        </Col>

        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="paymentTypeId"
            label="cash.fields.paymentType"
            path={selectListEndpoints.paymentTypesSelectList}
          />
        </Col>
        <Col span={4}>
          <DocumentAccountSelect
            formik={formik}
            fieldName="cashChartAccountId"
            label="cash.fields.cashChartAccount"
            documentTypeId={documentTypeId}
            documentRoleCode={cashDocumentAccountRoleCodes.cashAccount}
            getFirst
          />
        </Col>
        <Col span={4}>
          {isTransfer ? (
            // a transfer lands on the receiving box's cash account
            <DocumentAccountSelect
              key="transfer"
              formik={formik}
              fieldName="offsetAccountId"
              label="cash.fields.offsetAccount"
              documentTypeId={documentTypeId}
              documentRoleCode={cashDocumentAccountRoleCodes.cashAccount}
              getFirst
            />
          ) : (
            <MoneyOffsetAccountSelect
              formik={formik}
              fieldName="offsetAccountId"
              label="cash.fields.offsetAccount"
              kind={kind}
            />
          )}
        </Col>
        {isExpense && (
          <Col span={4}>
            <SelectCustom
              formik={formik}
              fieldName="destinationCashBoxId"
              label="cash.fields.destinationCashBox"
              path={selectListEndpoints.cashBoxesSelectList}
              clearable
              getFirst={false}
              autoSelectSingle={false}
              onChange={(value) => {
                const transfer = Boolean(value);
                if (transfer === isTransfer) return;
                formik.setFieldValue("offsetAccountId", null, false);
                if (transfer) {
                  formik.setFieldValue("operationKindId", null, false);
                  formik.setFieldValue("counterpartyId", null, false);
                  formik.setFieldValue("contractId", null, false);
                }
              }}
            />
          </Col>
        )}
        {!isTransfer && (offsetKeptByEmployee || kind?.needsEmployee) && (
          <Col span={4}>
            <PayrollEmployeeSelect
              formik={formik}
              fieldName="employeeId"
              label="bank.fields.employee"
              required
            />
          </Col>
        )}
        {!isTransfer && kind?.counterpartyMode !== 0 && (
          <>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyId"
                label="bank.fields.counterparty"
                path={selectListEndpoints.counterpartiesSelectList}
                onChange={(value) => {
                  if (Number(value) !== Number(formik.values.counterpartyId)) {
                    formik.setFieldValue("contractId", null, false);
                    formik.setFieldValue("relatedDocumentId", null, false);
                  }
                }}
                addOption={{
                  bool: true,
                  permissionCode: counterpartyPermissions.create,
                  onClick: () => setCounterpartyCreateOpen(true),
                }}
              />
            </Col>
            <Col span={4}>
              <SelectCustom
                formik={formik}
                fieldName="contractId"
                label="bank.fields.contract"
                path={selectListEndpoints.contractsSelectList}
                queryParams={{
                  choosedDate: dayjs(formik.values.docDate).format(
                    formatDateWithOutTime,
                  ),
                  [filterIds.counterparty]: counterpartyId,
                }}
                enabled={Boolean(counterpartyId)}
                refetchSync={`${counterpartyId ?? ""}${formik.values.docDate ?? ""}`}
                disabled={!counterpartyId}
                addOption={{
                  bool: true,
                  permissionCode: contractPermissions.create,
                  onClick: () => setContractCreateOpen(true),
                }}
              />
            </Col>
            <SettlementDocumentSelect
              formik={formik}
              colSpan={4}
              counterpartyId={counterpartyId}
              contractId={Number(formik.values.contractId) || null}
              directionId={isExpense ? -1 : 1}
              currencyId={Number(formik.values.currencyId) || null}
              date={formik.values.docDate}
              excludeDocumentTypeId={CASH_OPERATION_DOCUMENT_TYPE_ID}
              excludeDocumentId={documentId}
            />
          </>
        )}

        <Col span={4}>
          <SelectDate
            formik={formik}
            fieldName="docDate"
            label="bank.fields.date"
          />
        </Col>
        <Col span={4}>
          <SelectCustom
            formik={formik}
            fieldName="currencyId"
            label="settings.fields.currency"
            path={selectListEndpoints.currenciesSelectList}
          />
        </Col>
        {Number(formik.values.currencyId) > 1 && (
          <Col span={4}>
            <InputNumberFormat
              formik={formik}
              fieldName="exchangeRate"
              label="currency.rate"
              min={0}
              precision={6}
            />
          </Col>
        )}
        <Col span={4}>
          <InputNumberFormat
            formik={formik}
            fieldName="amount"
            label="bank.fields.amount"
            min={0}
            precision={2}
          />
        </Col>
        {!isTransfer && (
          <MoneyDocumentAnalytics formik={formik} offsetAccountId={Number(formik.values.offsetAccountId) || null} />
        )}
      </Row>
      {/* the order's own lines, as KO-1 / KO-2 print them (1C «Принято от» / «Выдать», «Основание», «Приложение») */}
      <Row gutter={[16, 0]}>
        <Col span={6}>
          <InputText formik={formik} fieldName="personName" label={isExpense ? "cash.fields.issueTo" : "cash.fields.receivedFrom"} />
        </Col>
        <Col span={6}>
          <InputText formik={formik} fieldName="basis" label="cash.fields.basis" />
        </Col>
        <Col span={6}>
          <InputText formik={formik} fieldName="attachment" label="cash.fields.attachment" />
        </Col>
        {isExpense && (
          <Col span={6}>
            <InputText formik={formik} fieldName="idDocument" label="cash.fields.idDocument" />
          </Col>
        )}
      </Row>
      <CounterpartyAddEditPage
        open={counterpartyCreateOpen}
        onCreated={(counterparty) => {
          formik.setFieldValue("counterpartyId", counterparty.id, true);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyId",
            selectListEndpoints.counterpartiesSelectList,
          );
        }}
        onClose={() => setCounterpartyCreateOpen(false)}
      />
      <ContractAddEditPage
        open={contractCreateOpen}
        initialCounterpartyId={counterpartyId}
        initialContractDate={formik.values.docDate ? dayjs(formik.values.docDate).format(formatDate) : undefined}
        onCreated={(contract) => {
          formik.setFieldValue("contractId", contract.id, true);
          invalidateSelectListQuery(
            queryClient,
            "contractId",
            selectListEndpoints.contractsSelectList,
          );
        }}
        onClose={() => setContractCreateOpen(false)}
      />
    </>
  );
}
