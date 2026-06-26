import { useEffect } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import InputText from "@/components/fields/InputText";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import {
  useCreateSettingsBank,
  useGetDetailSettingsBank,
  useUpdateSettingsBank,
} from "../hooks";
import { settingsBankSchema } from "../types/schema";
import type { SettingsBankCreate, SettingsBankUpdate } from "../types/type";
import type { SettingsBankForm } from "../types/form";

const defaultValues: SettingsBankForm = {
  code: "",
  name: "",
  mfo: "",
  stateId: null,
};

interface SettingsBankAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function SettingsBankAddEditPage({
  open,
  onClose,
  id,
}: SettingsBankAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data, isLoading } = useGetDetailSettingsBank(editId ?? "");
  const createMutation = useCreateSettingsBank();
  const updateMutation = useUpdateSettingsBank();

  const formik = useFormik<SettingsBankForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: settingsBankSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        const basePayload: SettingsBankCreate = {
          code: values.code.trim(),
          name: values.name.trim(),
          mfo: values.mfo.trim() || null,
        };

        if (isEdit && editId) {
          const payload: SettingsBankUpdate = {
            ...basePayload,
            stateId: Number(values.stateId),
          };
          await updateMutation.mutateAsync({ id: editId, payload });
          toast.success(t("settings.messages.updated"));
        } else {
          await createMutation.mutateAsync(basePayload);
          toast.success(t("settings.messages.created"));
        }

        helpers.resetForm();
        onClose();
      } catch (err: unknown) {
        errorHandlers(err);
      }
    },
  });
  const { setValues } = formik;

  useEffect(() => {
    if (data && isEdit) {
      setValues({
        code: data.code ?? "",
        name: data.name ?? "",
        mfo: data.mfo ?? "",
        stateId: data.stateId ?? null,
      });
    }
  }, [data, isEdit, setValues]);

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
      footer={null}
      centered
      width={620}
    >
      <Spin spinning={isLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="code"
                label="settings.fields.code"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="name"
                label="settings.fields.name"
              />
            </Col>
            <Col span={isEdit ? 12 : 24}>
              <InputText
                formik={formik}
                fieldName="mfo"
                label="settings.fields.mfo"
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
