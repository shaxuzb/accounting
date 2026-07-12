import { Button, Col, Form, Row, Segmented, Spin } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "@/config/dayjs";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import {
  chartAccountOptionLabel,
  chartAccountSelectedLabel,
  filterIds,
  selectListEndpoints,
} from "@/shared/constants/selectLists";
import { formatDateWithOutTime } from "@/utils/helpers";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCreateBankOperation,
  useGetDetailBankOperation,
  useUpdateBankOperation,
} from "../hooks";
import { schema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";
import Card from "@/components/ui/card/Card";
import CounterpartyAddEditPage from "@/modules/settings/pages/counterparty/screens/CounterpartyAddEditPage";
import ContractAddEditPage from "@/modules/contract/screens/ContractAddEditPage";
import CounterpartyBankAccountAddEditPage from "@/modules/settings/pages/counterpartybankaccount/screens/CounterpartyBankAccountAddEditPage";
import { counterpartyPermissions } from "@/modules/settings/pages/counterparty/constants/permissions";
import { counterpartybankaccountPermissions } from "@/modules/settings/pages/counterpartybankaccount/constants/permissions";
import { contractPermissions } from "@/modules/contract/constants/permissions";
import type { Contract } from "@/modules/contract/types/type";
import { invalidateSelectListQuery } from "@/shared/utils/invalidateSelectListQuery";

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

type BankOperationForm = Omit<
  BankOperationCreatePayload,
  | "bankAccountId"
  | "operationTypeId"
  | "paymentTypeId"
  | "counterpartyId"
  | "currencyId"
  | "amount"
  | "comment"
> & {
  bankAccountId: number | null;
  operationTypeId: number | null;
  paymentTypeId: number | null;
  counterpartyId: number | null;
  currencyId: number | null;
  amount: number | null;
  comment: string;
  stateId: number | null;
  counterpartyBankAccountId: number | null;
  contractId: number | null;
  exchangeRate: number | null;
};

const defaultValues: BankOperationForm = {
  bankAccountId: null,
  bankChartAccountId: null,
  offsetAccountId: null,
  operationTypeId: 1,
  paymentTypeId: null,
  counterpartyId: null,
  counterpartyBankAccountId: null,
  contractId: null,
  exchangeRate: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  comment: "",
  stateId: null,
};

export default function BankOperationAddEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const isEdit = Boolean(id);
  const createMutation = useCreateBankOperation();
  const updateMutation = useUpdateBankOperation();
  const { data: record, isLoading: isDetailLoading } =
    useGetDetailBankOperation(id);
  const queryClient = useQueryClient();
  const [counterpartyCreateOpen, setCounterpartyCreateOpen] = useState(false);
  const [counterpartyBankAccountCreateOpen, setCounterpartyBankAccountCreateOpen] =
    useState(false);
  const [contractCreateOpen, setContractCreateOpen] = useState(false);
  const initialValues = useMemo<BankOperationForm>(
    () => ({
      bankAccountId: record?.bankAccountId ?? null,
      bankChartAccountId: record?.bankChartAccountId ?? null,
      offsetAccountId: record?.offsetAccountId ?? null,
      operationTypeId: record?.operationTypeId ?? null,
      paymentTypeId: record?.paymentTypeId ?? null,
      counterpartyId: record?.counterpartyId ?? null,
      counterpartyBankAccountId: record?.counterpartyBankAccountId ?? null,
      contractId: record?.contractId ?? null,
      exchangeRate: record?.exchangeRate ?? null,
      docDate: record?.docDate ?? defaultValues.docDate,
      currencyId: record?.currencyId ?? null,
      amount: record?.amount ?? null,
      comment: record?.comment ?? "",
      stateId: record?.stateId ?? null,
    }),
    [record],
  );

  const formik = useFormik<BankOperationForm>({
    initialValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        const payload: BankOperationCreatePayload = {
          bankAccountId: Number(values.bankAccountId),
          bankChartAccountId: Number(values.bankChartAccountId),
          offsetAccountId: Number(values.offsetAccountId),
          operationTypeId: Number(values.operationTypeId),
          paymentTypeId: Number(values.paymentTypeId),
          counterpartyId: Number(values.counterpartyId),
          counterpartyBankAccountId: Number(values.counterpartyBankAccountId),
          docDate: dayjs(values.docDate).toISOString(),
          currencyId: Number(values.currencyId),
          amount: Number(values.amount),
          exchangeRate: Number(values.exchangeRate),
          contractId: Number(values.contractId),
          comment: values.comment.trim() || null,
          ...(isEdit ? { stateId: Number(values.stateId) } : {}),
        };

        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        navigate("..");
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });
  const { setFieldValue } = formik;

  const handleContractCreated = (contract: Contract) => {
    setFieldValue("contractId", contract.id, true);
    invalidateSelectListQuery(
      queryClient,
      "contractId",
      selectListEndpoints.contractsSelectList,
    );
  };

  const operationTypeId = useMemo(
    () => toPositiveNumber(formik.values.operationTypeId),
    [formik.values.operationTypeId],
  );
  const previousCounterpartyId = useRef<number | null>(null);
  const counterpartyId = useMemo(
    () => toPositiveNumber(formik.values.counterpartyId),
    [formik.values.counterpartyId],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (
      previousCounterpartyId.current !== null &&
      previousCounterpartyId.current !== counterpartyId
    ) {
      setFieldValue("counterpartyBankAccountId", null, false);
      setFieldValue("contractId", null, false);
    }
    previousCounterpartyId.current = counterpartyId;
  }, [counterpartyId, setFieldValue]);

  return (
    <div className="w-full ">
      <Card className="w-full border border-border p-4">
        <div className=" flex justify-between mb-6 ">
          <div className="text-xl font-semibold text-text">
            {isEdit
              ? t("settings.form.editTitle")
              : t("settings.form.createTitle")}
          </div>
          <div className="w-80">
            <Segmented
              block
              options={[
                { label: "Kirim", value: 1 },
                { label: "Chiqim", value: 2 },
              ]}
              value={operationTypeId ?? undefined}
              disabled={isSubmitting}
              onChange={(value) =>
                formik.setFieldValue("operationTypeId", value)
              }
            />
          </div>
        </div>

        <Spin spinning={isSubmitting || isDetailLoading}>
          <Form layout="vertical" onFinish={formik.handleSubmit}>
            <Row gutter={[24, 8]}>
              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="bankAccountId"
                  label="bank.fields.bankAccount"
                  path={selectListEndpoints.orgBankAccountsSelectList}
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="bankChartAccountId"
                  label="Bank schyoti"
                  path={selectListEndpoints.chartAccountsSelectList}
                  optionLabel={chartAccountOptionLabel}
                  selectedLabel={chartAccountSelectedLabel}
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="offsetAccountId"
                  label="Qarama-qarshi schyot"
                  path={selectListEndpoints.chartAccountsSelectList}
                  optionLabel={chartAccountOptionLabel}
                  selectedLabel={chartAccountSelectedLabel}
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="paymentTypeId"
                  label="To'lov turi"
                  path={selectListEndpoints.paymentTypesSelectList}
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="counterpartyId"
                  label="bank.fields.counterparty"
                  path={selectListEndpoints.counterpartiesSelectList}
                  addOption={{
                    bool: true,
                    permissionCode: counterpartyPermissions.create,
                    onClick: () => setCounterpartyCreateOpen(true),
                  }}
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="counterpartyBankAccountId"
                  label="Counterparty bank hisob raqami"
                  path={selectListEndpoints.counterPartyBankAccounts}
                  queryParams={{
                    [filterIds.counterparty]: counterpartyId,
                  }}
                  enabled={Boolean(counterpartyId)}
                  refetchSync={String(counterpartyId ?? "")}
                  disabled={!counterpartyId}
                  addOption={{
                    bool: true,
                    permissionCode: counterpartybankaccountPermissions.create,
                    onClick: () => setCounterpartyBankAccountCreateOpen(true),
                  }}
                />
              </Col>

              <Col span={8}>
                <InputNumberFormat
                  formik={formik}
                  fieldName="exchangeRate"
                  label="Kurs"
                  min={0}
                  precision={6}
                />
              </Col>

              <Col span={8}>
                <SelectDate
                  formik={formik}
                  fieldName="docDate"
                  label="bank.fields.date"
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="currencyId"
                  label="settings.fields.currency"
                  path={selectListEndpoints.currenciesSelectList}
                />
              </Col>

              <Col span={8}>
                <InputNumberFormat
                  formik={formik}
                  fieldName="amount"
                  label="bank.fields.amount"
                />
              </Col>

              <Col span={8}>
                <SelectCustom
                  formik={formik}
                  fieldName="contractId"
                  label="Shartnoma"
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
              {isEdit ? (
                <>
                  <Col span={8}>
                    <SelectCustom
                      formik={formik}
                      fieldName="stateId"
                      label="settings.fields.status"
                      path={selectListEndpoints.statesSelectList}
                    />
                  </Col>
                  <Col span={8}>
                    <InputText
                      formik={formik}
                      fieldName="comment"
                      label="bank.fields.comment"
                    />
                  </Col>
                </>
              ) : (
                <Col span={16}>
                  <InputText
                    formik={formik}
                    fieldName="comment"
                    label="bank.fields.comment"
                  />
                </Col>
              )}
            </Row>

            <div className=" flex justify-end gap-3 ">
              <Button onClick={() => navigate("..")}>
                {t("common.cancel")}
              </Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t("common.submit")}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
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
      <CounterpartyBankAccountAddEditPage
        open={counterpartyBankAccountCreateOpen}
        onClose={() => {
          setCounterpartyBankAccountCreateOpen(false);
          invalidateSelectListQuery(
            queryClient,
            "counterpartyBankAccountId",
            selectListEndpoints.counterPartyBankAccounts,
          );
        }}
      />
      <ContractAddEditPage
        open={contractCreateOpen}
        initialCounterpartyId={formik.values.counterpartyId}
        onCreated={handleContractCreated}
        onClose={() => {
          setContractCreateOpen(false);
        }}
      />
    </div>
  );
}
