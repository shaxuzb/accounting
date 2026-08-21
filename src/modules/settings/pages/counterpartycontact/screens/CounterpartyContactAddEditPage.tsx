import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { CounterpartyContactForm } from "../types/form";
import { useGetDetailCounterpartycontact } from "../hooks/useGetDetailCounterpartycontact";
import { useCreateCounterpartycontact } from "../hooks/useCreateCounterpartycontact";
import { useUpdateCounterpartycontact } from "../hooks/useUpdateCounterpartycontact";
import { counterpartyContactSchema } from "../types/schema";
import InputPhoneNumber from "@/components/fields/InputPhoneNumber";

const defaultValues: CounterpartyContactForm = {
  organizationId: null,
  counterpartyId: null,
  fullName: "",
  phoneNumber: "",
  email: "",
  position: "",
  comment: "",
  stateId: null,
};

interface CounterpartyContactAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function CounterpartyContactAddEditPage({
  open,
  onClose,
  id,
}: CounterpartyContactAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: CounterpartyContacts, isLoading: isOrgonizationsLoading } =
    useGetDetailCounterpartycontact(editId ?? "");
  const createMutation = useCreateCounterpartycontact();
  const updateMutation = useUpdateCounterpartycontact();

  const formik = useFormik<CounterpartyContactForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: counterpartyContactSchema(isEdit),
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
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });

  useEffect(() => {
    if (CounterpartyContacts && isEdit) {
      formik.setValues({
        organizationId: CounterpartyContacts.organizationId ?? null,
        counterpartyId: CounterpartyContacts.counterpartyId ?? null,
        fullName: CounterpartyContacts.fullName ?? "",
        phoneNumber: CounterpartyContacts.phoneNumber ?? "",
        email: CounterpartyContacts.email ?? "",
        position: CounterpartyContacts.position ?? "",
        comment: CounterpartyContacts.comment ?? "",
        stateId: CounterpartyContacts.stateId ?? null,
      });
    }
  }, [CounterpartyContacts, formik, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal maskClosable={false}
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
      width={650}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="fullName"
                label="settings.fields.fullName"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="comment"
                label="settings.fields.comment"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="counterpartyId"
                label="settings.fields.counterparty"
                path={selectListEndpoints.counterpartiesSelectList}
              />
            </Col>

            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="organizationId"
                label="settings.fields.organization"
                path={selectListEndpoints.operationTypesSelectList}
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="position"
                label="settings.fields.position"
              />
            </Col>
            <Col span={12}>
              <InputPhoneNumber
                formik={formik}
                fieldName="phoneNumber"
                label="settings.fields.phoneNumber"
              />
            </Col>

            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="email"
                label="settings.fields.email"
              />
            </Col>

            <Col span={12}>
              {isEdit && (
                <SelectCustom
                  formik={formik}
                  fieldName="stateId"
                  label="settings.fields.status"
                  path={selectListEndpoints.statesSelectList}
                />
              )}
            </Col>
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
