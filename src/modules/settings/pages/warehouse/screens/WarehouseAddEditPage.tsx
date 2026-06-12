import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row, Spin } from "antd";
import toast from "react-hot-toast";
import { errorHandlers } from "@/utils/helpers/errorHandlers";
import SelectCustom from "@/components/fields/SelectCustom";
import { selectListEndpoints } from "@/shared/constants/selectLists";
import InputText from "@/components/fields/InputText";
import type { WarehouseForm } from "../types/form";
import { useGetDetailWarehouses } from "../hooks/useGetDetailWarehouses";
import { useCreateWarehouses } from "../hooks/useCreateWarehouses";
import { useUpdateWarehouses } from "../hooks/useUpdateWarehouses";
import { warehouseSchema } from "../types/schema";

const defaultValues: WarehouseForm = {
  organizationId: null,
  branchId: null,
  code: "",
  name: "",
  responsibleUserId: null,
  stateId: null,
};

interface WarehouseAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function WarehouseAddEditPage({
  open,
  onClose,
  id,
}: WarehouseAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data: Warehouses, isLoading: isOrgonizationsLoading } =
    useGetDetailWarehouses(editId ?? "");
  const createMutation = useCreateWarehouses();
  const updateMutation = useUpdateWarehouses();

  const formik = useFormik<WarehouseForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: warehouseSchema(isEdit),
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
    if (Warehouses && isEdit) {
      formik.setValues({
        organizationId: Warehouses.organizationId ?? null,
        branchId: Warehouses.branchId ?? null,
        code: Warehouses.code ?? "",
        name: Warehouses.name ?? "",
        responsibleUserId: Warehouses.responsibleUserId ?? null,
        stateId: Warehouses.stateId ?? null,
      });
    }
  }, [Warehouses, isEdit]);
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
      width={600}
    >
      <Spin spinning={isOrgonizationsLoading}>
        <Form layout="vertical" onFinish={formik.handleSubmit}>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="name"
                label="settings.fields.name"
              />
            </Col>
            <Col span={12}>
              <InputText
                formik={formik}
                fieldName="code"
                label="settings.fields.code"
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
              <SelectCustom
                formik={formik}
                fieldName="branchId"
                label="settings.fields.branch"
                path={selectListEndpoints.branchesSelectList}
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="responsibleUserId"
                label="settings.fields.responsibleUser"
                path={selectListEndpoints.usersSelectList}
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
            onClick={() => console.log(formik)}
            loading={isSubmitting}
          >
            {t("common.submit")}
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
}
