import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCreatePaymentAcceptancePoint,
  useGetDetailPaymentAcceptancePoint,
  useUpdatePaymentAcceptancePoint,
} from "../hooks";
import type { PaymentAcceptancePointForm } from "../types/form";
import { paymentAcceptancePointSchema } from "../types/schema";
import { toCreatePayload, toUpdatePayload } from "../utils/payload";

const defaultValues: PaymentAcceptancePointForm = {
  typeId: null,
  bankAccountId: null,
  name: "",
  merchantId: "",
  externalId: "",
  serialNumber: "",
  stateId: null,
};

interface PaymentAcceptancePointAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function PaymentAcceptancePointAddEditPage({
  open,
  onClose,
  id,
}: PaymentAcceptancePointAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: detail, isLoading, isError } = useGetDetailPaymentAcceptancePoint(
    editId ?? "",
  );
  const createMutation = useCreatePaymentAcceptancePoint();
  const updateMutation = useUpdatePaymentAcceptancePoint();

  const formik = useFormik<PaymentAcceptancePointForm>({
    initialValues: defaultValues,
    validationSchema: paymentAcceptancePointSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({
            id: editId,
            payload: toUpdatePayload(values),
          });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(toCreatePayload(values));
          toast.success(t("settings.messages.created"));
        }
        helpers.resetForm();
        onClose();
      } catch (error: unknown) {
        errorHandlers(error);
      }
    },
  });
  const { setValues } = formik;

  useEffect(() => {
    if (!detail || !isEdit) return;

    void setValues({
      typeId: detail.typeId ?? null,
      bankAccountId: detail.bankAccountId ?? null,
      name: detail.name ?? "",
      merchantId: detail.merchantId ?? "",
      externalId: detail.externalId ?? "",
      serialNumber: detail.serialNumber ?? "",
      stateId: detail.stateId ?? null,
    });
  }, [detail, isEdit, setValues]);

  const closeModal = () => {
    formik.resetForm();
    onClose();
  };
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      maskClosable={false}
      title={
        isEdit
          ? t("settings.form.editPaymentAcceptancePoint")
          : t("settings.form.createPaymentAcceptancePoint")
      }
      open={open}
      onCancel={closeModal}
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      <Spin spinning={isLoading}>
        {isError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t("error.title")}
          </div>
        )}
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="name"
                label="settings.fields.name"
                required
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="typeId"
                label="settings.fields.paymentAcceptancePointType"
                path={selectListEndpoints.paymentAcceptancePointTypesSelectList}
                required
                search
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="bankAccountId"
                label="settings.fields.bankAccount"
                path={selectListEndpoints.orgBankAccountsSelectList}
                search
                clearable
                optional
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="merchantId"
                label="settings.fields.merchantId"
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="externalId"
                label="settings.fields.externalId"
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="serialNumber"
                label="settings.fields.serialNumber"
              />
            </Col>
            {isEdit && (
              <Col xs={24} md={12}>
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                  required
                />
              </Col>
            )}
          </Row>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={closeModal}>{t("common.cancel")}</Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {t("common.submit")}
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
}
