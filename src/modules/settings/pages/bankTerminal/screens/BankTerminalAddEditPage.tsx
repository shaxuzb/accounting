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
  useCreateBankTerminal,
  useGetDetailBankTerminal,
  useUpdateBankTerminal,
} from "../hooks";
import type { BankTerminalForm } from "../types/form";
import { bankTerminalSchema } from "../types/schema";

const defaultValues: BankTerminalForm = {
  bankAccountId: null,
  name: "",
  merchantId: "",
  externalTerminalId: "",
  serialNumber: "",
  stateId: null,
};

interface BankTerminalAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function BankTerminalAddEditPage({
  open,
  onClose,
  id,
}: BankTerminalAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: detail, isLoading } = useGetDetailBankTerminal(editId ?? "");
  const createMutation = useCreateBankTerminal();
  const updateMutation = useUpdateBankTerminal();

  const formik = useFormik<BankTerminalForm>({
    initialValues: defaultValues,
    validationSchema: bankTerminalSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        if (isEdit && editId) {
          await updateMutation.mutateAsync({ id: editId, payload: values });
          toast.success(t("settings.messages.updated"));
        } else {
          const { stateId: _stateId, ...createPayload } = values;
          await createMutation.mutateAsync(createPayload);
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
      bankAccountId: detail.bankAccountId ?? null,
      name: detail.name ?? "",
      merchantId: detail.merchantId ?? "",
      externalTerminalId: detail.externalTerminalId ?? "",
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
      title={
        isEdit
          ? t("settings.form.editBankTerminal")
          : t("settings.form.createBankTerminal")
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
                fieldName="bankAccountId"
                label="settings.fields.bankAccount"
                path={selectListEndpoints.orgBankAccountsSelectList}
                required
                search
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
                fieldName="externalTerminalId"
                label="settings.fields.externalTerminalId"
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
