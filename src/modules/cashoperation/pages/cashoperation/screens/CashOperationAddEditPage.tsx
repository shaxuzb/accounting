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
import {
  useCreateCashOperation,
  useGetDetailCashOperation,
  useUpdateCashOperation,
} from "../hooks";
import { cashOperationSchema } from "../types/schema";
import type { CashOperationForm } from "../types/form";

const defaultValues: CashOperationForm = {
  cashBoxId: null,
  cashOperationId: null,
  operationTypeId: null,
  counterpartyId: null,
  docDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  currencyId: null,
  amount: null,
  comment: "",
  stateId: null,
};
interface CashOperationAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}
export default function CashOperationAddEditPage({
  open,
  onClose,
  id,
}: CashOperationAddEditPageProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(id);
  const createMutation = useCreateCashOperation();
  const updateMutation = useUpdateCashOperation();
  const { data: record, isLoading: isDetailLoading } =
    useGetDetailCashOperation(id);
  const formik = useFormik<CashOperationForm>({
    initialValues: defaultValues,
    enableReinitialize: true,
    validationSchema: cashOperationSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && id) {
          await updateMutation.mutateAsync({ id, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(values);
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
    if (!record) return;
    formik.setValues({
      cashBoxId: record.cashBoxId ?? null,
      cashOperationId: record.cashOperationId ?? null,
      operationTypeId: record.operationTypeId ?? null,
      counterpartyId: record.counterpartyId ?? null,
      docDate: record.docDate ?? defaultValues.docDate,
      currencyId: record.currencyId ?? null,
      amount: record.amount ?? null,
      comment: record.comment ?? "",
      stateId: record.stateId ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  if (!open) return null;
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
      footer={false}
      width={760}
      destroyOnHidden
    >
      <Spin spinning={isSubmitting || isDetailLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="cashBoxId"
                label="settings.entities.cashBox"
                path={selectListEndpoints.cashBoxesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="operationTypeId"
                label="Operatsiya turi"
                path={selectListEndpoints.operationTypes}
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
          <div className="mt-4 w-full">
            {/* <Button
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
            >
              {t("common.cancel")}
            </Button> */}
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
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
