import { Button, Col, Form, Modal, Row, Spin } from "antd";
import { useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import dayjs from "@/config/dayjs";
import InputNumberFormat from "@/components/fields/InputNumber";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import SelectDate from "@/components/fields/SelectDate";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import { useCreateBankOperation, useUpdateBankOperation } from "../hooks";

import { schema } from "../types/schema";
import type { BankOperationCreatePayload } from "../types/form";
import type { BankOperationData } from "../types/type";

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
};

const defaultValues: BankOperationForm = {
  bankAccountId: null,
  operationTypeId: null,
  counterpartyId: null,
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
        const payload: BankOperationCreatePayload = {
          bankAccountId: Number(values.bankAccountId),
          operationTypeId: Number(values.operationTypeId),
          counterpartyId: Number(values.counterpartyId),
          docDate: dayjs(values.docDate).toISOString(),
          currencyId: Number(values.currencyId),
          amount: Number(values.amount),
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

  useEffect(() => {
    if (!record || !open) return;

    formik.setValues({
      bankAccountId: record.bankAccountId ?? null,
      operationTypeId: record.operationTypeId ?? null,
      counterpartyId: record.counterpartyId ?? null,
      docDate: record.docDate ?? defaultValues.docDate,
      currencyId: record.currencyId ?? null,
      amount: record.amount ?? null,
      comment: record.comment ?? "",
      stateId: record.stateId ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record, open]);

  if (!open) return null;

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      title={
        isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")
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
              <SelectCustom
                formik={formik}
                fieldName="operationTypeId"
                label="bank.fields.operationType"
                path={selectListEndpoints.bankOperationTypesSelectList}
              />
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
