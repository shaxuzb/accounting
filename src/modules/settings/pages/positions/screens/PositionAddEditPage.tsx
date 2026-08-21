import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { PositionsForm } from "../types/form";
import { useGetDetailPositions } from "../hooks";
import { useCreatePositions } from "../hooks";
import { useUpdatePositions } from "../hooks";
import { positionsSchema } from "../types/schema";


const defaultValues: PositionsForm = {
  organizationId: null,
  code: "",
  name: "",
  stateId: null,
};

interface PositionAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function PositionAddEditPage({
  open,
  onClose,
  id,
}: PositionAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Positions, isLoading: isOrgonizationsLoading } =
    useGetDetailPositions(editId ?? "");
  const createMutation = useCreatePositions();
  const updateMutation = useUpdatePositions();

  const formik = useFormik<PositionsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: positionsSchema(isEdit),
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
    if (Positions && isEdit) {
      formik.setValues({
        organizationId: Positions.organizationId ?? null,
        code: Positions.code ?? "",
        name: Positions.name ?? "",
        stateId: Positions.stateId ?? null,
      });
    }
  }, [Positions, formik, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal maskClosable={false}
      title={isEdit ? t("settings.form.editTitle") : t("settings.form.createTitle")}
      open={open}
      onCancel={() => {
        formik.resetForm();
        onClose();
      }}
      footer={null}
      centered
      width={450}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="settings.fields.organization"
            path={selectListEndpoints.organizationsSelectList}
          />

          <InputText formik={formik} fieldName="code" label="settings.fields.code" />
          <InputText formik={formik} fieldName="name" label="settings.fields.name" />

          {isEdit && (
            <SelectCustom
              formik={formik}
              fieldName="stateId"
              label="settings.fields.status"
              path={selectListEndpoints.statesSelectList}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="h-12 rounded-xl bg-blue-600! hover:bg-blue-700! font-semibold text-base"
            loading={isSubmitting}
          >{t("common.submit")}</Button>
        </Form>
      </Spin>
    </Modal>
  );
}
