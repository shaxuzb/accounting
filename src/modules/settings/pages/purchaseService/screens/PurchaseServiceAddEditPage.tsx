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
  useCreatePurchaseService,
  useGetDetailPurchaseService,
  useUpdatePurchaseService,
} from "../hooks";
import { purchaseServiceSchema } from "../types/schema";
import type {
  PurchaseServiceCreate,
  PurchaseServiceUpdate,
} from "../types/type";
import type { PurchaseServiceForm } from "../types/form";

const defaultValues: PurchaseServiceForm = {
  name: "",
  description: "",
  serviceTypeId: null,
  stateId: null,
};

interface PurchaseServiceAddEditPageProps {
  open: boolean;
  onClose: () => void;
  id?: number | null;
}

export default function PurchaseServiceAddEditPage({
  open,
  onClose,
  id,
}: PurchaseServiceAddEditPageProps) {
  const { t } = useTranslation();
  const editId = id ?? null;
  const isEdit = Boolean(editId);
  const { data, isLoading } = useGetDetailPurchaseService(editId ?? "");
  const createMutation = useCreatePurchaseService();
  const updateMutation = useUpdatePurchaseService();

  const formik = useFormik<PurchaseServiceForm>({
    initialValues: {
      ...defaultValues,
      stateId: isEdit ? null : 1,
    },
    enableReinitialize: true,
    validationSchema: purchaseServiceSchema(isEdit),
    onSubmit: async (values, helpers) => {
      try {
        const basePayload: PurchaseServiceCreate = {
          name: values.name.trim(),
          description: values.description.trim() || null,
          serviceTypeId: Number(values.serviceTypeId),
        };

        if (isEdit && editId) {
          const payload: PurchaseServiceUpdate = {
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
        name: data.name ?? "",
        description: data.description ?? "",
        serviceTypeId: data.serviceTypeId ?? null,
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
                fieldName="name"
                label="settings.fields.name"
              />
            </Col>
            <Col span={12}>
              <SelectCustom
                formik={formik}
                fieldName="serviceTypeId"
                label="settings.fields.serviceTypeId"
                path={selectListEndpoints.serviceTypesSelectList}
              />
            </Col>
            {isEdit ? (
              <>
                <Col span={12}>
                  <InputText
                    formik={formik}
                    fieldName="description"
                    label={t("settings.fields.description")}
                  />
                </Col>
                <Col span={12}>
                  <SelectCustom
                    formik={formik}
                    fieldName="stateId"
                    label="settings.fields.status"
                    path={selectListEndpoints.statesSelectList}
                  />
                </Col>
              </>
            ) : (
              <Col span={24}>
                <InputText
                  formik={formik}
                  fieldName="description"
                  label={t("settings.fields.description")}
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
