import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import type { ChartAccountsForm } from "../types/form";
import InputPasword from "@/components/fields/InputPassword";
import InputText from "@/components/fields/InputText";

import InputPhoneNumber from "@/components/fields/InputPhoneNumber";
import { useCreateChartAccounts } from "../hooks";
import { useUpdateChartAccounts } from "../hooks";
import { useGetDetailChartAccounts } from "../hooks";
import { chartAccountsSchema } from "../types/schema";

const defaultValues: ChartAccountsForm = {
  organizationId: null,
  parentId: null,
  code: "",
  name: "",
  isGroup: false,
  stateId: null,
};

interface ChartAccountAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function ChartAccountAddEditPage({
  open,
  onClose,
  id,
}: ChartAccountAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Chartaccounts, isLoading: isOrgonizationsLoading } =
    useGetDetailChartAccounts(editId ?? "");
  const createMutation = useCreateChartAccounts();
  const updateMutation = useUpdateChartAccounts();

  const formik = useFormik<ChartAccountsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: chartAccountsSchema(isEdit),
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
    if (Chartaccounts && isEdit) {
      formik.setValues({
        organizationId: Chartaccounts.organizationId ?? null,
        parentId: Chartaccounts.parentId ?? null,
        code: Chartaccounts.code ?? "",
        name: Chartaccounts.name ?? "",
        isGroup: Chartaccounts.isGroup ?? false,
        stateId: Chartaccounts.stateId ?? null,
      });
    }
  }, [Chartaccounts, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
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
          <InputText formik={formik} fieldName="name" label="settings.fields.name" />
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="settings.fields.organization"
            path={selectListEndpoints.operationTypesSelectList}
          />
          <InputPasword formik={formik} fieldName="code" label="settings.fields.code" />

          <InputPhoneNumber
            formik={formik}
            fieldName="phoneNumber"
            label="settings.fields.phoneNumber"
          />

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
            onClick={() => console.log(formik)}
            loading={isSubmitting}
          >{t("common.submit")}</Button>
        </Form>
      </Spin>
    </Modal>
  );
}
