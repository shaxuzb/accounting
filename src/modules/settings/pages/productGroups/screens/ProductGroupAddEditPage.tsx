import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Form, Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { ProductGroupsForm } from "../types/form";
import { productGroupsSchema } from "../types/schema";
import { useUpdateProductGroups } from "../hooks";
import { useCreateProductGroups } from "../hooks";
import { useGetDetailProductGroups } from "../hooks";

const defaultValues: ProductGroupsForm = {
  organizationId: null,
  parentId: null,
  code: "",
  name: "",
  stateId: null,
};

interface ProductGroupAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function ProductGroupAddEditPage({
  open,
  onClose,
  id,
}: ProductGroupAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: ProductGroups, isLoading: isOrgonizationsLoading } =
    useGetDetailProductGroups(editId ?? "");
  const createMutation = useCreateProductGroups();
  const updateMutation = useUpdateProductGroups();

  const formik = useFormik<ProductGroupsForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
      parentId: null,
    },
    enableReinitialize: true,
    validationSchema: productGroupsSchema(isEdit),
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
    if (ProductGroups && isEdit) {
      formik.setValues({
        organizationId: ProductGroups.organizationId ?? null,
        parentId: ProductGroups.parentId ?? null,
        code: ProductGroups.code ?? "",
        name: ProductGroups.name ?? "",
        stateId: ProductGroups.stateId ?? null,
      });
    }
  }, [ProductGroups, formik, isEdit]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      mask={{ closable: false }}
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
      width={450}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <SelectCustom
            formik={formik}
            fieldName="organizationId"
            label="settings.fields.organization"
            path={selectListEndpoints.operationTypesSelectList}
          />
          <InputText
            formik={formik}
            fieldName="name"
            label="settings.fields.name"
          />

          <InputText
            formik={formik}
            fieldName="code"
            label="settings.fields.code"
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
            loading={isSubmitting}
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
