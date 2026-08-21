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
  useCreateFiscalCashRegister,
  useGetDetailFiscalCashRegister,
  useUpdateFiscalCashRegister,
} from "../hooks";
import type { FiscalCashRegisterForm } from "../types/form";
import { fiscalCashRegisterSchema } from "../types/schema";

const defaultValues: FiscalCashRegisterForm = {
  warehouseId: null,
  registerTypeId: null,
  name: "",
  externalRegisterId: "",
  model: "",
  serialNumber: "",
  fiscalModuleNumber: "",
  stateId: null,
};

interface FiscalCashRegisterAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function FiscalCashRegisterAddEditPage({
  open,
  onClose,
  id,
}: FiscalCashRegisterAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: detail, isLoading } = useGetDetailFiscalCashRegister(
    editId ?? "",
  );
  const createMutation = useCreateFiscalCashRegister();
  const updateMutation = useUpdateFiscalCashRegister();

  const formik = useFormik<FiscalCashRegisterForm>({
    initialValues: defaultValues,
    validationSchema: fiscalCashRegisterSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(values);
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
      warehouseId: detail.warehouseId ?? null,
      registerTypeId: detail.registerTypeId ?? null,
      name: detail.name ?? "",
      externalRegisterId: detail.externalRegisterId ?? "",
      model: detail.model ?? "",
      serialNumber: detail.serialNumber ?? "",
      fiscalModuleNumber: detail.fiscalModuleNumber ?? "",
      stateId: detail.stateId ?? null,
    });
  }, [detail, isEdit, setValues]);

  const closeModal = () => {
    formik.resetForm();
    onClose();
  };
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal maskClosable={false}
      title={
        isEdit
          ? t("settings.form.editFiscalCashRegister")
          : t("settings.form.createFiscalCashRegister")
      }
      open={open}
      onCancel={closeModal}
      footer={null}
      centered
      width={760}
      destroyOnHidden
    >
      <Spin spinning={isLoading}>
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
                fieldName="registerTypeId"
                label="settings.fields.registerType"
                path={selectListEndpoints.fiscalCashRegisterTypesSelectList}
                required
                search
              />
            </Col>
            <Col xs={24} md={12}>
              <SelectCustom
                formik={formik}
                fieldName="warehouseId"
                label="settings.entities.warehouse"
                path={selectListEndpoints.warehousesSelectList}
                clearable
                search
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="externalRegisterId"
                label="settings.fields.externalRegisterId"
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="model"
                label="settings.fields.model"
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="serialNumber"
                label="settings.fields.serialNumber"
              />
            </Col>
            <Col xs={24} md={12}>
              <InputText
                formik={formik}
                fieldName="fiscalModuleNumber"
                label="settings.fields.fiscalModuleNumber"
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
