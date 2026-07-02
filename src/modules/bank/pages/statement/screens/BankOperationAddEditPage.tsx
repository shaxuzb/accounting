import { Button, Col, Form, Modal, Row, Select, Segmented, Spin } from "antd";
import { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import dayjs from "@/config/dayjs";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { selectListKeys } from "@/shared/constants/selectLists";
import { $axiosPrivate } from "@/services/AxiosService";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useCreateBankOperation, useUpdateBankOperation } from "../hooks";

import { schema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";
import type { BankOperationData } from "../types/type";

interface PaymentPurposeOption {
  id: number;
  name: string;
}

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

type BankOperationForm = Omit<
  BankOperationCreatePayload,
  | "bankAccountId"
  | "operationTypeId"
  | "counterpartyId"
  | "currencyId"
  | "amount"
  | "comment"
> & {
  bankAccountId: number | null;
  operationTypeId: number | null;
  counterpartyId: number | null;
  currencyId: number | null;
  amount: number | null;
  comment: string;
  stateId: number | null;
  paymentPurposeId: number | null;
  counterpartyBankAccountId: number | null;
  contractId: number | null;
  exchangeRate: number | null;
};

const defaultValues: BankOperationForm = {
  bankAccountId: null,
  operationTypeId: null,
  paymentPurposeId: null,
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

interface BankOperationAddEditPageProps {
  open: boolean;
  onClose: () => void;
  record?: BankOperationData | null;
}

export default function BankOperationAddEditPage({
  open,
  onClose,
  record,
}: BankOperationAddEditPageProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(record?.id);
  const createMutation = useCreateBankOperation();
  const updateMutation = useUpdateBankOperation();
  const formik = useFormik<BankOperationForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        const paymentPurposeId = toPositiveNumber(values.paymentPurposeId);
        const payload: BankOperationCreatePayload = {
          bankAccountId: Number(values.bankAccountId),
          operationTypeId: Number(values.operationTypeId),
          ...(paymentPurposeId ? { paymentPurposeId } : {}),
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

        if (isEdit && record?.id) {
          await updateMutation.mutateAsync({ id: record.id, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(payload);
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  const operationTypeId = useMemo(
    () => toPositiveNumber(formik.values.operationTypeId),
    [formik.values.operationTypeId],
  );

  const {
    data: paymentPurposeOptions = [],
    isLoading: isPaymentPurposeLoading,
  } = useQuery<PaymentPurposeOption[]>({
    queryKey: ["selectlist", selectListKeys.paymentPurpose, operationTypeId],
    queryFn: async () => {
      const { data } = await $axiosPrivate.get<PaymentPurposeOption[]>(
        `${selectListEndpoints.paymentPurposesSelectList}?operationTypeId=${operationTypeId}`,
      );
      return data ?? [];
    },
    enabled: open && Boolean(operationTypeId),
  });

  const paymentPurposeOptionsForSelect = useMemo(
    () =>
      paymentPurposeOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [paymentPurposeOptions],
  );

  useEffect(() => {
    if (!record || !open) return;

    formik.setValues({
      bankAccountId: record.bankAccountId ?? null,
      operationTypeId: record.operationTypeId ?? null,
      paymentPurposeId: record.paymentPurposeId ?? null,
      counterpartyId: record.counterpartyId ?? null,
      counterpartyBankAccountId: record.counterpartyBankAccountId ?? null,
      contractId: record.contractId ?? null,
      exchangeRate: record.exchangeRate ?? null,
      docDate: record.docDate ?? defaultValues.docDate,
      currencyId: record.currencyId ?? null,
      amount: record.amount ?? null,
      comment: record.comment ?? "",
      stateId: record.stateId ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, open]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    const selectedPaymentPurposeId = toPositiveNumber(
      formik.values.paymentPurposeId,
    );
    if (!operationTypeId || !selectedPaymentPurposeId) return;

    const isAllowed = paymentPurposeOptions.some(
      (option) => option.id === selectedPaymentPurposeId,
    );
    if (!isAllowed) {
      formik.setFieldValue("paymentPurposeId", null, false);
    }
  }, [formik, operationTypeId, paymentPurposeOptions]);

  if (!open) return null;

  return (
    <Modal
      title={
        <div className="flex justify-between">
          <div>
            {isEdit
              ? t("settings.form.editTitle")
              : t("settings.form.createTitle")}
          </div>
          <div className="w-70 mr-8">
            {/* <Col span={12}> */}
            <Segmented
              block
              options={[
                { label: "Kirim", value: 1 },
                { label: "Chiqim", value: 2 },
              ]}
              value={operationTypeId ?? undefined}
              disabled={isSubmitting}
              onChange={(value) =>
                formik.setFieldValue("operationTypeId", value, true)
              }
            />
            {/* </Col> */}
          </div>
        </div>
      }
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      <Spin spinning={createMutation.isPending}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="bankAccountId"
                label="bank.fields.bankAccount"
                path={selectListEndpoints.orgBankAccountsSelectList}
              />
            </Col>

            <Col span={12}>
              <Form.Item label="To'lov maqsadi">
                <Select
                  showSearch
                  value={formik.values.paymentPurposeId ?? undefined}
                  placeholder="To'lov maqsadini tanlang"
                  options={paymentPurposeOptionsForSelect}
                  allowClear
                  loading={isPaymentPurposeLoading}
                  // disabled={isSubmitting || !formik.values.operationTypeId}
                  onChange={(value) =>
                    formik.setFieldValue(
                      "paymentPurposeId",
                      value ? Number(value) : null,
                      true,
                    )
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyId"
                label="bank.fields.counterparty"
                path={selectListEndpoints.counterpartiesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyBankAccountId"
                label="Counterparty bank hisob raqami"
                path={selectListEndpoints.counterPartyBankAccounts}
              />
            </Col>
            <Col span={12}>
              <InputNumberFormat
                formik={formik}
                fieldName="exchangeRate"
                label="Kurs"
                min={0}
                precision={6}
              />
            </Col>
            <Col span={12}>
              <SelectDate
                formik={formik}
                fieldName="docDate"
                label="bank.fields.date"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="currencyId"
                label="settings.fields.currency"
                path={selectListEndpoints.currenciesSelectList}
              />
            </Col>
            <Col span={12}>
              <InputNumberFormat
                formik={formik}
                fieldName="amount"
                label="bank.fields.amount"
                min={0}
                precision={2}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="contractId"
                label="Shartnoma"
                path={selectListEndpoints.contractsSelectList}
              />
            </Col>
            <Col span={24}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="bank.fields.comment"
              />
            </Col>
            {isEdit && (
              <Col span={12}>
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              </Col>
            )}
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            loading={isSubmitting}
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
